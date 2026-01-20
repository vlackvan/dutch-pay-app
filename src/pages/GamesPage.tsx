import { useState, useMemo, useCallback, useEffect } from 'react';
import styles from './games/GamesPage.module.css';
import { useMyGroups } from '@/hooks/queries/useGroups';

import { useAuthStore } from '@/stores/auth.store';
import type { GroupListResponse, GameType, GroupParticipantResponse } from '@/types/api.types';
import { groupsApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

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


  const [step, setStep] = useState<Step>('selectGame');
  const [selectedGroup, setSelectedGroup] = useState<GroupListResponse | null>(null);
  const [selectedGameType, setSelectedGameType] = useState<GameTypeOption | null>(null);

  // Setup game state
  const [settlementTitle, setSettlementTitle] = useState<string>('');
  const [amount, setAmount] = useState<number>(10000);
  const [settlementIcon, setSettlementIcon] = useState<string>(DEFAULT_ICON);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [showIntro, setShowIntro] = useState(true);
  const [gameResult, setGameResult] = useState<{
    winner: 'left' | 'right';
    leftTeam: { id: number; name: string }[];
    rightTeam: { id: number; name: string }[];
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
    // Game logic removed
    setStep('play');
    setShowIntro(true);
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const handleJudgmentReady = (
    leftTeam: { id: number; name: string }[],
    rightTeam: { id: number; name: string }[],
    winner: 'left' | 'right'
  ) => {
    setGameResult({
      winner,
      leftTeam,
      rightTeam
    });
    setStep('result');
  };



  const canProceed = useMemo(() => {
    if (step === 'selectGame') return !!selectedGameType;
    if (step === 'selectGroup') return !!selectedGroup;
    if (step === 'setupGame') return selectedParticipants.length >= 2 && amount > 0 && settlementTitle.trim() !== '';
    return false;
  }, [step, selectedGroup, selectedGameType, selectedParticipants.length, amount, settlementTitle]);

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
          <img className={styles.bottomCharacter} src="/game-character.png" alt="" />
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
              <input
                type="text"
                className={styles.titleInput}
                placeholder="예: 점심값, 회식비 등"
                value={settlementTitle}
                onChange={(e) => setSettlementTitle(e.target.value)}
              />
            </div>

            <div className={styles.setupSection}>
              <h3 className={styles.subTitle}>금액</h3>
              <div className={styles.amountInput}>
                <span>₩</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="10000"
                />
              </div>
            </div>

            <div className={styles.setupSection}>
              <h3 className={styles.subTitle}>아이콘</h3>
              <IconDropdown selectedIcon={settlementIcon} onSelectIcon={setSettlementIcon} size="medium" />
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
                      {(member.name ?? member.user_name ?? '').slice(0, 1)}

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
            onBack={resetGame}
          />
        )}

      </div>
    </div>
  );
}
