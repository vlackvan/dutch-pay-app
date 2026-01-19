import { useState, useMemo, useCallback } from 'react';
import styles from './games/GamesPage.module.css';
import { useMyGroups } from '@/hooks/queries/useGroups';
import { useCreateGame } from '@/hooks/queries/useGames';
import { useAuthStore } from '@/stores/auth.store';
import type { GroupListResponse, GameType, GroupParticipantResponse } from '@/types/api.types';
import { groupsApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

type Step = 'selectGame' | 'selectGroup' | 'setupGame' | 'play' | 'result';
type GameTypeOption = 'roulette' | 'bomb' | 'psychological';

interface GameResult {
  winners?: { participantId: number; name: string; amount: number }[]; // For psychological game
  loserParticipantId?: number;
  loserName?: string;
  amount: number;
  splitResult?: { participantId: number; name: string; amount: number }[]; // For split payment
}

interface PsychologicalChoice {
  participantId: number;
  choice: 'trust' | 'betray' | null;
}

const GAMES: { type: GameTypeOption; name: string; icon: string; desc: string; apiType: GameType }[] = [
  { type: 'bomb', name: '폭탄 게임', icon: '💣', desc: '스위치를 선택하라!', apiType: 'BOMB' },
  { type: 'roulette', name: '룰렛 돌리기', icon: '🎡', desc: '운명의 룰렛', apiType: 'PINBALL_ROULETTE' },
  { type: 'psychological', name: '심리 게임', icon: '🧠', desc: '죄수의 딜레마', apiType: 'PSYCHOLOGICAL' },
];

const SETTLEMENT_ICONS = ['💰', '🍕', '🍔', '☕', '🎮', '🎬', '🎤', '🎸', '🏀', '⚽'];

export default function GamesPage() {
  const currentUser = useAuthStore((state) => state.user);
  const { data: groups = [], isLoading: groupsLoading } = useMyGroups();
  const createGame = useCreateGame();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('selectGame');
  const [selectedGroup, setSelectedGroup] = useState<GroupListResponse | null>(null);
  const [selectedGameType, setSelectedGameType] = useState<GameTypeOption | null>(null);

  // Setup game state
  const [settlementTitle, setSettlementTitle] = useState<string>('');
  const [amount, setAmount] = useState<number>(10000);
  const [settlementIcon, setSettlementIcon] = useState<string>('💰');
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);

  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  // Roulette state
  const [isSpinning, setIsSpinning] = useState(false);
  const [rouletteRotation, setRouletteRotation] = useState(0);

  // Bomb game state
  const [bombSwitches, setBombSwitches] = useState<('hidden' | 'safe' | 'bomb')[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);

  // Psychological game state
  const [psychoChoices, setPsychoChoices] = useState<PsychologicalChoice[]>([]);
  const [psychoCurrentTurn, setPsychoCurrentTurn] = useState(0);
  const [psychoPhase, setPsychoPhase] = useState<'choosing' | 'reveal' | 'judging'>('choosing');
  const [psychoJudgment, setPsychoJudgment] = useState<{
    trustCount: number;
    betrayCount: number;
    losingTeam: 'trust' | 'betray' | 'tie' | null;
  } | null>(null);

  const { data: groupDetail } = useQuery({
    queryKey: ['groups', 'detail', selectedGroup?.id],
    queryFn: () => groupsApi.getGroup(selectedGroup!.id),
    enabled: !!selectedGroup?.id,
  });

  const participants: GroupParticipantResponse[] = groupDetail?.participants || [];

  const resetGame = useCallback(() => {
    setStep('selectGame');
    setSelectedGroup(null);
    setSelectedGameType(null);
    setSettlementTitle('');
    setAmount(10000);
    setSettlementIcon('💰');
    setSelectedParticipants([]);
    setGameResult(null);
    setIsSpinning(false);
    setRouletteRotation(0);
    setBombSwitches([]);
    setCurrentTurn(0);
    setPsychoChoices([]);
    setPsychoCurrentTurn(0);
    setPsychoPhase('choosing');
    setPsychoJudgment(null);
  }, []);

  const goBack = useCallback(() => {
    if (step === 'selectGroup') {
      setStep('selectGame');
      setSelectedGroup(null);
    } else if (step === 'setupGame') {
      setStep('selectGroup');
      setSelectedGameType(null);
    } else if (step === 'play') {
      setStep('setupGame');
      setSelectedParticipants([]);
    } else if (step === 'result') {
      resetGame();
    }
  }, [step, resetGame]);

  const toggleParticipant = (participantId: number) => {
    setSelectedParticipants((prev) =>
      prev.includes(participantId) ? prev.filter((id) => id !== participantId) : [...prev, participantId]
    );
  };

  const initializeGame = useCallback(() => {
    if (selectedGameType === 'bomb') {
      const n = selectedParticipants.length;
      const switches: ('hidden' | 'safe' | 'bomb')[] = Array(n).fill('hidden');
      const bombIndex = Math.floor(Math.random() * n);
      // Store bomb position internally
      setBombSwitches(switches.map((_, i) => (i === bombIndex ? 'bomb' : 'hidden')));
      setCurrentTurn(0);
    } else if (selectedGameType === 'psychological') {
      setPsychoChoices(
        selectedParticipants.map((pid) => ({
          participantId: pid,
          choice: null,
        }))
      );
      setPsychoCurrentTurn(0);
      setPsychoPhase('choosing');
      setPsychoJudgment(null);
    }
  }, [selectedGameType, selectedParticipants]);

  const handleStartGame = () => {
    if (selectedParticipants.length < 2) {
      alert('최소 2명 이상의 참가자가 필요합니다.');
      return;
    }
    if (!settlementTitle.trim()) {
      alert('정산 제목을 입력해주세요.');
      return;
    }
    initializeGame();
    setStep('play');
  };

  // Roulette logic
  const spinRoulette = () => {
    if (isSpinning || selectedParticipants.length === 0) return;

    setIsSpinning(true);
    const randomRotation = 1800 + Math.random() * 1800;
    setRouletteRotation((prev) => prev + randomRotation);

    setTimeout(() => {
      const loserIndex = Math.floor(Math.random() * selectedParticipants.length);
      const loserParticipantId = selectedParticipants[loserIndex];
      const loserMember = participants.find((m) => m.id === loserParticipantId);
      const loserName = loserMember?.name || loserMember?.user_name || 'Unknown';

      setGameResult({ loserParticipantId, loserName, amount });
      setIsSpinning(false);
      setStep('result');
    }, 3000);
  };

  // Bomb game logic
  const revealBombSwitch = (index: number) => {
    if (bombSwitches[index] !== 'hidden' && bombSwitches[index] !== 'bomb') return;

    const isBomb = bombSwitches[index] === 'bomb';

    setBombSwitches((prev) => {
      const newSwitches = [...prev];
      newSwitches[index] = isBomb ? 'bomb' : 'safe';
      return newSwitches;
    });

    if (isBomb) {
      const currentPlayer = selectedParticipants[currentTurn % selectedParticipants.length];
      const loserMember = participants.find((m) => m.id === currentPlayer);
      const loserName = loserMember?.name || loserMember?.user_name || 'Unknown';

      setTimeout(() => {
        setGameResult({ loserParticipantId: currentPlayer, loserName, amount });
        setStep('result');
      }, 1500);
    } else {
      setCurrentTurn((prev) => prev + 1);
    }
  };

  // Psychological game logic
  const handlePsychoChoice = (choice: 'trust' | 'betray') => {
    const currentParticipantId = selectedParticipants[psychoCurrentTurn];

    setPsychoChoices((prev) =>
      prev.map((c) =>
        c.participantId === currentParticipantId ? { ...c, choice } : c
      )
    );

    if (psychoCurrentTurn < selectedParticipants.length - 1) {
      setPsychoCurrentTurn((prev) => prev + 1);
    } else {
      // All choices made, reveal phase
      setTimeout(() => {
        setPsychoPhase('reveal');

        // Calculate judgment after reveal animation
        setTimeout(() => {
          const trustCount = psychoChoices.filter((c) => c.choice === 'trust').length + 1; // +1 for last choice
          const betrayCount = psychoChoices.filter((c) => c.choice === 'betray').length;

          let losingTeam: 'trust' | 'betray' | 'tie' | null = null;
          if (trustCount > betrayCount) {
            losingTeam = 'betray';
          } else if (betrayCount > trustCount) {
            losingTeam = 'trust';
          } else {
            losingTeam = 'tie';
          }

          setPsychoJudgment({ trustCount, betrayCount, losingTeam });
          setPsychoPhase('judging');

          // Calculate results
          setTimeout(() => {
            calculatePsychologicalResult(losingTeam, trustCount, betrayCount);
          }, 3000);
        }, 2000);
      }, 500);
    }
  };

  const calculatePsychologicalResult = (
    losingTeam: 'trust' | 'betray' | 'tie' | null,
    trustCount: number,
    betrayCount: number
  ) => {
    const n = selectedParticipants.length;

    if (losingTeam === 'trust') {
      // Trust team loses, split among them
      const trustMembers = psychoChoices
        .filter((c) => c.choice === 'trust')
        .map((c) => c.participantId);

      const splitAmount = amount / trustMembers.length;
      const splitResult = trustMembers.map((pid) => {
        const member = participants.find((m) => m.id === pid);
        return {
          participantId: pid,
          name: member?.name || member?.user_name || 'Unknown',
          amount: splitAmount,
        };
      });

      setGameResult({ splitResult, amount });
      setStep('result');
    } else if (losingTeam === 'betray') {
      // Betray team loses, roulette among betrayers
      const betrayMembers = psychoChoices
        .filter((c) => c.choice === 'betray')
        .map((c) => c.participantId);

      const loserIndex = Math.floor(Math.random() * betrayMembers.length);
      const loserParticipantId = betrayMembers[loserIndex];
      const loserMember = participants.find((m) => m.id === loserParticipantId);
      const loserName = loserMember?.name || loserMember?.user_name || 'Unknown';

      setGameResult({ loserParticipantId, loserName, amount });
      setStep('result');
    } else if (losingTeam === 'tie') {
      // Tie: trust split half, betray roulette for half
      const trustMembers = psychoChoices
        .filter((c) => c.choice === 'trust')
        .map((c) => c.participantId);

      const betrayMembers = psychoChoices
        .filter((c) => c.choice === 'betray')
        .map((c) => c.participantId);

      const halfAmount = amount / 2;
      const trustSplitAmount = halfAmount / trustMembers.length;

      const trustSplit = trustMembers.map((pid) => {
        const member = participants.find((m) => m.id === pid);
        return {
          participantId: pid,
          name: member?.name || member?.user_name || 'Unknown',
          amount: trustSplitAmount,
        };
      });

      const betrayLoserIndex = Math.floor(Math.random() * betrayMembers.length);
      const betrayLoserId = betrayMembers[betrayLoserIndex];
      const betrayLoser = participants.find((m) => m.id === betrayLoserId);

      const splitResult = [
        ...trustSplit,
        {
          participantId: betrayLoserId,
          name: betrayLoser?.name || betrayLoser?.user_name || 'Unknown',
          amount: halfAmount,
        },
      ];

      setGameResult({ splitResult, amount });
      setStep('result');
    } else {
      // All trust: split evenly
      const splitAmount = amount / n;
      const splitResult = selectedParticipants.map((pid) => {
        const member = participants.find((m) => m.id === pid);
        return {
          participantId: pid,
          name: member?.name || member?.user_name || 'Unknown',
          amount: splitAmount,
        };
      });

      setGameResult({ splitResult, amount });
      setStep('result');
    }
  };

  const confirmResult = () => {
    if (!gameResult || !selectedGroup || !selectedGameType) return;

    const gameData = GAMES.find((g) => g.type === selectedGameType);

    // For psychological game with split results, we need to create multiple settlements
    // For now, we'll use the first loser or create a simplified version
    let loserParticipantId: number;

    if (gameResult.loserParticipantId) {
      loserParticipantId = gameResult.loserParticipantId;
    } else if (gameResult.splitResult && gameResult.splitResult.length > 0) {
      // Use first person in split as representative
      loserParticipantId = gameResult.splitResult[0].participantId;
    } else {
      alert('결과를 처리할 수 없습니다.');
      return;
    }

    createGame.mutate(
      {
        group_id: selectedGroup.id,
        game_type: gameData!.apiType,
        participants: selectedParticipants,
        loser_participant_id: loserParticipantId,
        amount: gameResult.amount,
        game_data: {
          game_type: selectedGameType,
          settlement_title: settlementTitle,
          settlement_icon: settlementIcon,
        },
      },
      {
        onSuccess: () => {
          alert('정산이 생성되었습니다!');
          resetGame();
        },
        onError: () => {
          alert('정산 생성에 실패했습니다.');
        },
      }
    );
  };

  const currentPlayerName = useMemo(() => {
    if (selectedGameType === 'bomb' && selectedParticipants.length > 0) {
      const currentPlayerId = selectedParticipants[currentTurn % selectedParticipants.length];
      const member = participants.find((m) => m.id === currentPlayerId);
      return member?.name || member?.user_name || '';
    }
    if (selectedGameType === 'psychological' && selectedParticipants.length > 0) {
      const currentPlayerId = selectedParticipants[psychoCurrentTurn % selectedParticipants.length];
      const member = participants.find((m) => m.id === currentPlayerId);
      return member?.name || member?.user_name || '';
    }
    return '';
  }, [selectedGameType, currentTurn, psychoCurrentTurn, selectedParticipants, participants]);

  const canProceed = useMemo(() => {
    if (step === 'selectGame') return !!selectedGameType;
    if (step === 'selectGroup') return !!selectedGroup;
    if (step === 'setupGame') return selectedParticipants.length >= 2 && amount > 0 && settlementTitle.trim() !== '';
    return false;
  }, [step, selectedGroup, selectedGameType, selectedParticipants.length, amount, settlementTitle]);

  if (groupsLoading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.title}>사나이 클럽</div>
        </header>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.title}>사나이 클럽</div>
      </header>

      <div className={styles.content}>
        {/* Step Indicator */}
        <div className={styles.stepIndicator}>
          {['selectGame', 'selectGroup', 'setupGame', 'play', 'result'].map((s, i) => (
            <div
              key={s}
              className={`${styles.step} ${
                step === s ? styles.stepActive : i < ['selectGame', 'selectGroup', 'setupGame', 'play', 'result'].indexOf(step) ? styles.stepCompleted : ''
              }`}
            />
          ))}
        </div>

        {step !== 'selectGame' && (
          <button className={styles.backBtn} onClick={goBack}>
            ← 뒤로
          </button>
        )}

        {/* Step 1: Select Game */}
        {step === 'selectGame' && (
          <>
            <div className={styles.mainScreen}>
              <div className={styles.angryFishBg}>🐟💢</div>
              <h2 className={styles.mainTitle}>사나이 클럽</h2>
              <p className={styles.mainDesc}>게임을 선택하세요</p>
            </div>

            <div className={styles.gameGrid}>
              {GAMES.map((game) => (
                <button
                  key={game.type}
                  className={`${styles.gameCard} ${selectedGameType === game.type ? styles.gameCardSelected : ''}`}
                  onClick={() => setSelectedGameType(game.type)}
                >
                  <div className={styles.gameIcon}>{game.icon}</div>
                  <div className={styles.gameName}>{game.name}</div>
                  <div className={styles.gameDesc}>{game.desc}</div>
                </button>
              ))}
            </div>

            <div className={styles.buttonRow}>
              <button
                className={styles.primaryBtn}
                disabled={!canProceed}
                onClick={() => setStep('selectGroup')}
              >
                다음
              </button>
            </div>
          </>
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
                    <div className={styles.groupIcon}>{group.icon || '🧾'}</div>
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
              <div className={styles.iconGrid}>
                {SETTLEMENT_ICONS.map((icon) => (
                  <button
                    key={icon}
                    className={`${styles.iconBtn} ${settlementIcon === icon ? styles.iconBtnSelected : ''}`}
                    onClick={() => setSettlementIcon(icon)}
                  >
                    {icon}
                  </button>
                ))}
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
                      {(member.name || member.user_name).slice(0, 1)}
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

        {/* Step 4: Play - Roulette */}
        {step === 'play' && selectedGameType === 'roulette' && (
          <>
            <h2 className={styles.sectionTitle}>룰렛 돌리기</h2>
            <p className={styles.sectionDesc}>버튼을 눌러 룰렛을 돌리세요!</p>
            <div className={styles.playArea}>
              <div className={styles.rouletteContainer}>
                <div className={styles.roulettePointer} />
                <div
                  className={styles.roulette}
                  style={{ transform: `rotate(${rouletteRotation}deg)` }}
                >
                  <div className={styles.rouletteInner}>
                    {selectedParticipants.map((pid, i) => {
                      const member = participants.find((m) => m.id === pid);
                      return (
                        <div
                          key={pid}
                          className={styles.rouletteSegment}
                          style={{
                            transform: `rotate(${(360 / selectedParticipants.length) * i}deg)`,
                          }}
                        >
                          {member?.name || member?.user_name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <button
                className={styles.spinBtn}
                onClick={spinRoulette}
                disabled={isSpinning}
              >
                {isSpinning ? '돌아가는 중...' : '돌리기!'}
              </button>
            </div>
          </>
        )}

        {/* Step 4: Play - Bomb */}
        {step === 'play' && selectedGameType === 'bomb' && (
          <>
            <h2 className={styles.sectionTitle}>폭탄 게임</h2>
            <p className={styles.sectionDesc}>
              현재 차례: <strong>{currentPlayerName}</strong>
            </p>
            <div className={styles.bombArea}>
              <div className={styles.bombIcon}>💣</div>
              <div className={styles.switchGrid}>
                {bombSwitches.map((sw, index) => (
                  <button
                    key={index}
                    className={`${styles.switchCard} ${sw === 'safe' ? styles.switchSafe : ''} ${sw === 'bomb' ? styles.switchBomb : ''}`}
                    onClick={() => revealBombSwitch(index)}
                    disabled={sw !== 'hidden' && sw !== 'bomb'}
                  >
                    {sw === 'hidden' || sw === 'bomb' ? (
                      <div className={styles.switchLever}>🎚️</div>
                    ) : sw === 'safe' ? (
                      '✅'
                    ) : (
                      '💥'
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Step 4: Play - Psychological */}
        {step === 'play' && selectedGameType === 'psychological' && (
          <>
            {psychoPhase === 'choosing' && (
              <>
                <h2 className={styles.sectionTitle}>심리 게임</h2>
                <div className={styles.psychoTurnScreen}>
                  <div className={styles.psychoAvatar}>
                    {currentPlayerName.slice(0, 1)}
                  </div>
                  <h3 className={styles.psychoPlayerName}>{currentPlayerName}님 차례입니다</h3>
                  <p className={styles.psychoDesc}>선택을 하세요</p>

                  <div className={styles.psychoChoiceButtons}>
                    <button
                      className={`${styles.psychoBtn} ${styles.psychoTrustBtn}`}
                      onClick={() => handlePsychoChoice('trust')}
                    >
                      <div className={styles.psychoBtnIcon}>🤝</div>
                      <div className={styles.psychoBtnText}>친구를 믿기</div>
                    </button>
                    <button
                      className={`${styles.psychoBtn} ${styles.psychoBetrayBtn}`}
                      onClick={() => handlePsychoChoice('betray')}
                    >
                      <div className={styles.psychoBtnIcon}>🗡️</div>
                      <div className={styles.psychoBtnText}>친구를 배신하기</div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {psychoPhase === 'reveal' && (
              <>
                <h2 className={styles.sectionTitle}>판별 중...</h2>
                <div className={styles.psychoRevealScreen}>
                  <div className={styles.psychoAvatarList}>
                    {selectedParticipants.map((pid) => {
                      const member = participants.find((m) => m.id === pid);
                      const choice = psychoChoices.find((c) => c.participantId === pid)?.choice;
                      return (
                        <div
                          key={pid}
                          className={`${styles.psychoAvatarCard} ${
                            choice === 'trust' ? styles.psychoTrustCard : styles.psychoBetrayCard
                          }`}
                        >
                          <div className={styles.psychoSmallAvatar}>
                            {(member?.name || member?.user_name || '').slice(0, 1)}
                          </div>
                          <div className={styles.psychoAvatarName}>
                            {member?.name || member?.user_name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className={styles.psychoCamps}>
                    <div className={styles.psychoCamp}>
                      <h4>친구 진영</h4>
                      <div className={styles.psychoCampMembers}>
                        {psychoChoices
                          .filter((c) => c.choice === 'trust')
                          .map((c) => {
                            const member = participants.find((m) => m.id === c.participantId);
                            return (
                              <div key={c.participantId} className={styles.psychoMemberBadge}>
                                {member?.name || member?.user_name}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                    <div className={styles.psychoCamp}>
                      <h4>배신 진영</h4>
                      <div className={styles.psychoCampMembers}>
                        {psychoChoices
                          .filter((c) => c.choice === 'betray')
                          .map((c) => {
                            const member = participants.find((m) => m.id === c.participantId);
                            return (
                              <div key={c.participantId} className={styles.psychoMemberBadge}>
                                {member?.name || member?.user_name}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {psychoPhase === 'judging' && psychoJudgment && (
              <>
                <h2 className={styles.sectionTitle}>판정 결과</h2>
                <div className={styles.psychoJudgmentScreen}>
                  <div className={styles.psychoJudgmentText}>
                    {psychoJudgment.losingTeam === 'trust' && (
                      <>
                        <h3 className={styles.psychoLosingTeam}>친구 진영이 패배했습니다!</h3>
                        <p className={styles.psychoJudgmentDesc}>나누자 친구야...</p>
                      </>
                    )}
                    {psychoJudgment.losingTeam === 'betray' && (
                      <>
                        <h3 className={styles.psychoLosingTeam}>배신 진영이 패배했습니다!</h3>
                        <p className={styles.psychoJudgmentDesc}>지금부터 서로 죽여라!</p>
                      </>
                    )}
                    {psychoJudgment.losingTeam === 'tie' && (
                      <>
                        <h3 className={styles.psychoLosingTeam}>무승부입니다!</h3>
                        <p className={styles.psychoJudgmentDesc}>양쪽 모두 손해를 봅니다</p>
                      </>
                    )}
                  </div>
                  <div className={styles.psychoCount}>
                    <div>친구: {psychoJudgment.trustCount}명</div>
                    <div>배신: {psychoJudgment.betrayCount}명</div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Step 5: Result */}
        {step === 'result' && gameResult && (
          <>
            <div className={styles.resultCard}>
              <div className={styles.resultIcon}>
                {selectedGameType === 'roulette' ? '🎡' : selectedGameType === 'bomb' ? '💥' : '🧠'}
              </div>
              <div className={styles.resultTitle}>게임 종료!</div>

              {gameResult.loserName && (
                <>
                  <div className={styles.resultLoser}>{gameResult.loserName}님이 당첨!</div>
                  <div className={styles.resultAmount}>₩{Math.round(gameResult.amount || 0).toLocaleString()}</div>
                </>
              )}

              {gameResult.splitResult && (
                <>
                  <div className={styles.resultSplitTitle}>정산 결과</div>
                  <div className={styles.resultSplitList}>
                    {gameResult.splitResult.map((r) => (
                      <div key={r.participantId} className={styles.resultSplitItem}>
                        <span className={styles.resultSplitName}>{r.name}</span>
                        <span className={styles.resultSplitAmount}>
                          ₩{Math.round(r.amount).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className={styles.resultDesc}>정산을 확정하면 자동으로 기록됩니다</div>
            </div>

            <div className={styles.buttonRow}>
              <button className={styles.secondaryBtn} onClick={() => navigate('/home')}>
                홈으로
              </button>
              <button
                className={styles.primaryBtn}
                onClick={confirmResult}
                disabled={createGame.isPending}
              >
                {createGame.isPending ? '처리 중...' : '기록하기'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
