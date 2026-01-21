import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import styles from './games/GamesPage.module.css';
import { groupKeys, useMyGroups } from '@/hooks/queries/useGroups';

import { useAuthStore } from '@/stores/auth.store';
import type { GroupListResponse, GameType, GroupParticipantResponse } from '@/types/api.types';
import { groupsApi, settlementsApi } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAudioContext } from '@/contexts/AudioContext';

import { IconDropdown } from '@/components/IconDropdown';
import { IconDisplay } from '@/components/IconPicker/IconPicker';
import { DEFAULT_ICON } from '@/constants/icons';
import { GameIntro } from './games/GameIntro';
import { GameStage } from './games/GameStage';
import { GameResult } from './games/GameResult';

type Step = 'selectGame' | 'selectGroup' | 'setupGame' | 'play' | 'result';
type GameTypeOption = string;


const GAMES: { type: GameTypeOption; name: string; icon: string; desc: string; apiType: GameType }[] = [
  { type: 'roulette', name: '게임장 입장', icon: '', desc: '', apiType: 'PINBALL_ROULETTE' },
];

export default function GamesPage() {
  const currentUser = useAuthStore((state) => state.user);
  const { data: groups = [], isLoading: groupsLoading } = useMyGroups();
  const queryClient = useQueryClient();
  const audio = useAudioContext();


  const [step, setStep] = useState<Step>('selectGame');
  const [selectedGroup, setSelectedGroup] = useState<GroupListResponse | null>(null);
  const [selectedGameType, setSelectedGameType] = useState<GameTypeOption | null>(null);

  // Setup game state
  const [settlementTitle, setSettlementTitle] = useState<string>('');
  const [amount, setAmount] = useState<number | ''>(10000);
  const [settlementIcon, setSettlementIcon] = useState<string>(DEFAULT_ICON);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [selectedPayerId, setSelectedPayerId] = useState<number | null>(null);
  const [payerOpen, setPayerOpen] = useState(false);
  const payerBoxRef = useRef<HTMLDivElement | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [gameResult, setGameResult] = useState<{
    winner: 'left' | 'right';
    leftTeam: { id: number; name: string; profilePhoto?: string | null; fullBodyPhoto?: string | null }[];
    rightTeam: { id: number; name: string; profilePhoto?: string | null; fullBodyPhoto?: string | null }[];
  } | null>(null);



  const { data: groupDetail } = useQuery({
    queryKey: ['groups', 'detail', selectedGroup?.id],
    queryFn: () => groupsApi.getGroup(selectedGroup!.id),
    enabled: !!selectedGroup?.id,
  });

  const participants: GroupParticipantResponse[] = groupDetail?.participants || [];

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = step === 'selectGame' ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [step]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!payerBoxRef.current) return;
      if (!payerBoxRef.current.contains(e.target as Node)) {
        setPayerOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // Default payer to current user when participants load
  useEffect(() => {
    if (participants.length > 0 && selectedPayerId === null) {
      const me = participants.find(p => p.user_id === currentUser?.id);
      if (me) {
        setSelectedPayerId(me.id);
      } else {
        setSelectedPayerId(participants[0].id);
      }
    }
  }, [participants, currentUser, selectedPayerId]);

  // Control music based on game step
  useEffect(() => {
    if (step === 'result') {
      // Switch to result music when entering result step
      audio.playResult();
    } else {
      // Play game music for all other steps
      // This will start game music on mount and resume it if returning from result
      audio.playGame();
    }
  }, [step, audio]);

  // Cleanup: when leaving the games page, resume main music
  useEffect(() => {
    return () => {
      audio.stopGame();
      audio.stopResult();
      audio.playMain();
    };
  }, [audio]);

  const resetGame = useCallback(() => {
    setStep('selectGame');
    setSelectedGroup(null);
    setSelectedGameType(null);
    setSettlementTitle('');
    setAmount(10000);
    setSettlementIcon(DEFAULT_ICON);
    setSelectedParticipants([]);
    setGameResult(null);
  }, []);

  const goBack = useCallback(() => {
    if (step === 'selectGroup') {
      setStep('selectGame');
      setSelectedGroup(null);
    } else if (step === 'setupGame') {
      setStep('selectGroup');
      setSelectedGameType(null);
    }
  }, [step, resetGame]);

  const toggleParticipant = (participantId: number) => {
    setSelectedParticipants((prev) =>
      prev.includes(participantId) ? prev.filter((id) => id !== participantId) : [...prev, participantId]
    );
  };

  const handleStartGame = () => {
    if (selectedParticipants.length < 2) {
      alert('최소 2명 이상의 참가자가 필요합니다.');
      return;
    }
    if (!settlementTitle.trim()) {
      alert('정산 제목을 입력해주세요.');
      return;
    }
    setStep('play');
    setShowIntro(true);
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const handleJudgmentReady = (
    leftTeam: { id: number; name: string; profilePhoto?: string | null; fullBodyPhoto?: string | null }[],
    rightTeam: { id: number; name: string; profilePhoto?: string | null; fullBodyPhoto?: string | null }[],
    winner: 'left' | 'right'
  ) => {
    setGameResult({
      winner,
      leftTeam,
      rightTeam
    });
    setStep('result');
  };

  const amountNumber = typeof amount === 'number' ? amount : 0;

  const canProceed = useMemo(() => {
    if (step === 'selectGame') return !!selectedGameType;
    if (step === 'selectGroup') return !!selectedGroup;
    if (step === 'setupGame') return selectedParticipants.length >= 2 && amountNumber > 0 && settlementTitle.trim() !== '';
    return false;
  }, [step, selectedGroup, selectedGameType, selectedParticipants.length, amountNumber, settlementTitle]);

  const payerLabel = useMemo(() => {
    const payer = participants.find((p) => p.id === selectedPayerId);
    if (!payer) return 'Select payer';
    const name = payer.name || payer.user_name || 'Unknown';
    return `${name}${payer.user_id === currentUser?.id ? ' (me)' : ''}`;
  }, [participants, selectedPayerId, currentUser?.id]);

  if (groupsLoading) {
    return (
      <div className={styles.page}>

        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${step !== 'selectGame' ? styles.pageActive : ''}`}>


      <div className={styles.content}>
        {step === 'selectGame' && (
          <>
            <img className={styles.bottomCharacter} src="/game-character.png" alt="" />
            <img className={styles.smallFishBubble} src="/small-fish-text.png" alt="" />
            <img className={styles.bigFishBubble} src="/big-fish-text.png" alt="" />
          </>
        )}
        {/* Step Indicator */}


        {step !== 'selectGame' && step !== 'play' && step !== 'result' && (
          <button className={styles.backBtn} onClick={goBack}>
            ← 뒤로
          </button>
        )}

        {/* Step 1: Select Game */}
        {step === 'selectGame' && (
          <div className={styles.selectGameCenter}>
            <div className={styles.gameGrid}>
              {GAMES.map((game) => (
                <button
                  key={game.type}
                  className={`${styles.gameCard} ${selectedGameType === game.type ? styles.gameCardSelected : ''}`}
                  onClick={() => {
                    setSelectedGameType(game.type);
                    window.setTimeout(() => {
                      setStep('selectGroup');
                    }, 120);
                  }}
                  type="button"
                >
                  <div className={styles.gameInfo}>
                    <div className={styles.gameName}>{game.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Group */}
        {step === 'selectGroup' && (
          <>
            <h2 className={styles.sectionTitle}>그룹 선택</h2>
            <p className={styles.sectionDesc}>게임을 진행할 그룹을 선택하세요</p>

            {groups.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>📋</div>
                <div className={styles.emptyText}>참여한 그룹이 없습니다</div>
              </div>
            ) : (
              <div className={styles.groupList}>
                {groups.map((group) => (
                  <button
                    key={group.id}
                    className={`${styles.groupCard} ${selectedGroup?.id === group.id ? styles.groupCardSelected : ''}`}
                    onClick={() => setSelectedGroup(group)}
                  >
                    <div className={styles.groupIcon}>
                      <IconDisplay icon={group.icon || undefined} className={styles.groupIconImg} size="44px" />
                    </div>
                    <div className={styles.groupInfo}>
                      <div className={styles.groupName}>{group.name}</div>
                      <div className={styles.groupMeta}>{group.member_count}명</div>
                    </div>
                    <div className={`${styles.checkIcon} ${selectedGroup?.id === group.id ? styles.checkIconSelected : ''}`}>
                      {selectedGroup?.id === group.id && '✓'}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className={styles.buttonRow}>
              <button
                className={styles.primaryBtn}
                disabled={!canProceed}
                onClick={() => setStep('setupGame')}
              >
                다음
              </button>
            </div>
          </>
        )}

        {/* Step 3: Setup Game (title, amount, icon, participants) */}
        {step === 'setupGame' && (
          <>
            <h2 className={styles.sectionTitle}>정산 정보 설정</h2>

            <div className={styles.setupSection}>
              <h3 className={styles.subTitle}>정산 제목</h3>
              <div className={styles.inputRow}>
                <input
                  type="text"
                  className={styles.titleInput}
                  placeholder="예: 점심값, 회식비 등"
                  value={settlementTitle}
                  onChange={(e) => setSettlementTitle(e.target.value)}
                  style={{ flex: 1 }}
                />
                <IconDropdown
                  selectedIcon={settlementIcon}
                  onSelectIcon={setSettlementIcon}
                  size="medium"
                  className={styles.gameIconDropdown}
                  menuClassName={styles.gameIconMenu}
                />
              </div>
            </div>

            <div className={styles.setupSection}>
              <h3 className={styles.subTitle}>금액</h3>
              <div className={styles.amountInput}>
                <span>₩</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    const next = e.target.value;
                    setAmount(next === '' ? '' : Number(next));
                  }}
                  placeholder="10000"
                />
              </div>
            </div>

            <div className={styles.setupSection}>
              <h3 className={styles.subTitle}>결제자</h3>
              <div className={styles.payerSelectWrap} ref={payerBoxRef}>
                <button
                  type="button"
                  className={styles.payerSelectBtn}
                  onClick={() => setPayerOpen((v) => !v)}
                  aria-expanded={payerOpen}
                  aria-label="Select payer"
                >
                  <span className={styles.payerSelectValue}>{payerLabel}</span>
                  <span className={styles.payerSelectChevron}>v</span>
                </button>

                {payerOpen && (
                  <div className={styles.payerMenu} role="listbox" aria-label="Select payer">
                    {participants.map((p) => {
                      const name = p.name || p.user_name || 'Unknown';
                      const label = `${name}${p.user_id === currentUser?.id ? ' (me)' : ''}`;
                      const isSelected = p.id === selectedPayerId;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          className={`${styles.payerMenuItem} ${isSelected ? styles.payerMenuItemActive : ''}`}
                          onClick={() => {
                            setSelectedPayerId(p.id);
                            setPayerOpen(false);
                          }}
                          role="option"
                          aria-selected={isSelected}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>



            <div className={styles.participantsSection}>
              <h3 className={styles.subTitle}>참가자 선택</h3>
              <p className={styles.sectionDesc}>최소 2명 이상 선택하세요</p>
              <div className={styles.participantList}>
                {participants.map((member) => (
                  <button
                    key={member.id}
                    className={`${styles.participantChip} ${selectedParticipants.includes(member.id) ? styles.participantChipSelected : ''}`}
                    onClick={() => toggleParticipant(member.id)}
                  >
                    <div className={styles.participantAvatar}>
                      {member.user_profile_photo_url ? (
                        <img
                          src={`http://localhost:8000${member.user_profile_photo_url}`}
                          alt={member.name || member.user_name || 'Participant'}
                          className={styles.participantAvatarImg}
                        />
                      ) : (
                        (member.name ?? member.user_name ?? '').slice(0, 1)
                      )}
                    </div>
                    <span>{member.name || member.user_name}</span>
                    {member.user_id === currentUser?.id && <span>(나)</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.buttonRow}>
              <button className={styles.secondaryBtn} onClick={goBack}>
                이전
              </button>
              <button
                className={styles.primaryBtn}
                disabled={!canProceed}
                onClick={handleStartGame}
              >
                게임 시작
              </button>
            </div>
          </>
        )}

        {/* Step 4: Play - Game Stage */}
        {step === 'play' && (
          <>
            {/* Game Stage - always rendered so background is visible */}
            <GameStage
              participants={participants
                .filter(p => selectedParticipants.includes(p.id))
                .map(p => ({
                  id: p.id,
                  name: p.name || p.user_name || 'Unknown',
                  profilePhoto: p.user_profile_photo_url,
                  fullBodyPhoto: p.user_full_body_photo_url,
                }))}
              onJudgmentReady={handleJudgmentReady}
            />

            {/* Game Intro Overlay - on top of game stage */}
            {showIntro && <GameIntro onComplete={handleIntroComplete} />}
          </>
        )}

        {/* Step 5: Result */}
        {step === 'result' && gameResult && (
          <GameResult
            winner={gameResult.winner}
            leftTeam={gameResult.leftTeam}
            rightTeam={gameResult.rightTeam}
            amount={amountNumber}
            onRestart={() => {
              // Restart with only losers
              const losers = gameResult.winner === 'left' ? gameResult.rightTeam : gameResult.leftTeam;
              if (losers.length < 2) {
                alert('패자부활전을 진행하기에 인원이 부족합니다 (최소 2명)');
                return;
              }
              setSelectedParticipants(losers.map(p => p.id));
              setGameResult(null);
              setStep('play');
              setShowIntro(true);
            }}
            onRecord={async () => {
              if (!selectedGroup || !currentUser) return;

              // Use selected payer
              const payer = participants.find(p => p.id === selectedPayerId);

              if (!payer) {
                alert("오류: 결제자 정보가 올바르지 않습니다.");
                return;
              }

              const losers = gameResult.winner === 'left' ? gameResult.rightTeam : gameResult.leftTeam;

              // Calculate shares manually for 'amount' split
              const count = losers.length;
              if (count === 0) return; // Should not happen but safety check

              const share = Math.floor(amountNumber / count);
              const remainder = amountNumber % count;

              const participantInputs = losers.map((p, idx) => ({
                participant_id: p.id,
                amount: share + (idx === 0 ? remainder : 0)
              }));

              // Validations: "Payer must be included in participants"
              // If Payer is not in the losers list, add them with 0 amount.
              const isPayerInLosers = losers.some(l => l.id === payer.id);
              if (!isPayerInLosers) {
                participantInputs.push({ participant_id: payer.id, amount: 0 });
              }

              try {
                await settlementsApi.create({
                  group_id: selectedGroup.id,
                  payer_participant_id: payer.id,
                  title: `[게임 결과] ${settlementTitle || '슈퍼 겁쟁이들의 벌칙'}`,
                  total_amount: amountNumber,
                  split_type: 'amount',
                  icon: settlementIcon,
                  participants: participantInputs,
                  date: new Date().toISOString().split('T')[0]
                });
                queryClient.invalidateQueries({ queryKey: groupKeys.settlements(selectedGroup.id) });
                alert('정산 결과가 기록되었습니다!');
                resetGame();
              } catch (error) {
                console.error('Failed to record settlement:', error);
                alert('기록 중 오류가 발생했습니다.');
              }
            }}
            onHome={resetGame}
          />
        )}

      </div>
    </div>
  );
}
