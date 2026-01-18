import { useState, useMemo, useCallback } from 'react';
import styles from './games/GamesPage.module.css';
import { useMyGroups } from '@/hooks/queries/useGroups';
import { useCreateGame } from '@/hooks/queries/useGames';
import { useAuthStore } from '@/stores/auth.store';
import type { GroupListResponse, GameType, GroupParticipantResponse } from '@/types/api.types';
import { groupsApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

type Step = 'selectGroup' | 'selectGame' | 'play' | 'result';
type GameTypeOption = 'roulette' | 'bomb';

interface GameResult {
  loserParticipantId: number;
  loserName: string;
  amount: number;
}

const GAMES: { type: GameTypeOption; name: string; icon: string; desc: string; apiType: GameType }[] = [
  { type: 'roulette', name: '룰렛', icon: '🎡', desc: '돌려돌려 룰렛!', apiType: 'PINBALL_ROULETTE' },
  { type: 'bomb', name: '폭탄 돌리기', icon: '💣', desc: '누가 폭탄을 잡을까?', apiType: 'BOMB' },
];

export default function GamesPage() {
  const currentUser = useAuthStore((state) => state.user);
  const { data: groups = [], isLoading: groupsLoading } = useMyGroups();
  const createGame = useCreateGame();

  const [step, setStep] = useState<Step>('selectGroup');
  const [selectedGroup, setSelectedGroup] = useState<GroupListResponse | null>(null);
  const [selectedGameType, setSelectedGameType] = useState<GameTypeOption | null>(null);
  const [amount, setAmount] = useState<number>(10000);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  // Roulette state
  const [isSpinning, setIsSpinning] = useState(false);
  const [rouletteRotation, setRouletteRotation] = useState(0);

  // Bomb game state
  const [bombCards, setBombCards] = useState<('hidden' | 'safe' | 'bomb')[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);

  const { data: groupDetail } = useQuery({
    queryKey: ['groups', 'detail', selectedGroup?.id],
    queryFn: () => groupsApi.getGroup(selectedGroup!.id),
    enabled: !!selectedGroup?.id,
  });

  const participants: GroupParticipantResponse[] = groupDetail?.participants || [];

  const resetGame = useCallback(() => {
    setStep('selectGroup');
    setSelectedGroup(null);
    setSelectedGameType(null);
    setAmount(10000);
    setSelectedParticipants([]);
    setGameResult(null);
    setIsSpinning(false);
    setRouletteRotation(0);
    setBombCards([]);
    setCurrentTurn(0);
  }, []);

  const goBack = useCallback(() => {
    if (step === 'selectGame') {
      setStep('selectGroup');
      setSelectedGameType(null);
    } else if (step === 'play') {
      setStep('selectGame');
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
      const cards: ('hidden' | 'safe' | 'bomb')[] = Array(9).fill('hidden');
      const bombIndex = Math.floor(Math.random() * 9);
      cards[bombIndex] = 'bomb';
      setBombCards(cards.map(() => 'hidden'));
      // Store actual bomb position in state
      setBombCards((prev) => {
        const newCards = [...prev];
        newCards[bombIndex] = 'bomb';
        return newCards.map((c) => (c === 'bomb' ? 'bomb' : 'hidden'));
      });
    }
  }, [selectedGameType]);

  const handleStartGame = () => {
    if (selectedParticipants.length < 2) {
      alert('최소 2명 이상의 참가자가 필요합니다.');
      return;
    }
    initializeGame();
    setStep('play');
  };

  const spinRoulette = () => {
    if (isSpinning || selectedParticipants.length === 0) return;

    setIsSpinning(true);
    const randomRotation = 1800 + Math.random() * 1800; // 5-10 full rotations
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

  const revealBombCard = (index: number) => {
    if (bombCards[index] !== 'hidden') return;

    setBombCards((prev) => {
      const newCards = [...prev];
      // Check if this is the bomb
      const isBomb = prev.filter((c) => c === 'bomb').length === 0
        ? Math.random() < 0.15 // Random chance if no bomb set
        : prev[index] === 'bomb';

      if (isBomb) {
        newCards[index] = 'bomb';
        const currentPlayer = selectedParticipants[currentTurn % selectedParticipants.length];
        const loserMember = participants.find((m) => m.id === currentPlayer);
        const loserName = loserMember?.name || loserMember?.user_name || 'Unknown';

        setTimeout(() => {
          setGameResult({ loserParticipantId: currentPlayer, loserName, amount });
          setStep('result');
        }, 500);
      } else {
        newCards[index] = 'safe';
        setCurrentTurn((prev) => prev + 1);
      }

      return newCards;
    });
  };

  const confirmResult = () => {
    if (!gameResult || !selectedGroup || !selectedGameType) return;

    const gameData = GAMES.find((g) => g.type === selectedGameType);

    createGame.mutate(
      {
        group_id: selectedGroup.id,
        game_type: gameData!.apiType,
        participants: selectedParticipants,
        loser_participant_id: gameResult.loserParticipantId,
        amount: gameResult.amount,
        game_data: { game_type: selectedGameType },
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
    if (selectedGameType !== 'bomb' || selectedParticipants.length === 0) return '';
    const currentPlayerId = selectedParticipants[currentTurn % selectedParticipants.length];
    const member = participants.find((m) => m.id === currentPlayerId);
    return member?.name || member?.user_name || '';
  }, [selectedGameType, currentTurn, selectedParticipants, participants]);

  const canProceed = useMemo(() => {
    if (step === 'selectGroup') return !!selectedGroup;
    if (step === 'selectGame') return !!selectedGameType && selectedParticipants.length >= 2 && amount > 0;
    return false;
  }, [step, selectedGroup, selectedGameType, selectedParticipants.length, amount]);

  if (groupsLoading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.title}>게임</div>
        </header>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.title}>게임</div>
      </header>

      <div className={styles.content}>
        {/* Step Indicator */}
        <div className={styles.stepIndicator}>
          {['selectGroup', 'selectGame', 'play', 'result'].map((s, i) => (
            <div
              key={s}
              className={`${styles.step} ${
                step === s ? styles.stepActive : i < ['selectGroup', 'selectGame', 'play', 'result'].indexOf(step) ? styles.stepCompleted : ''
              }`}
            />
          ))}
        </div>

        {step !== 'selectGroup' && (
          <button className={styles.backBtn} onClick={goBack}>
            ← 뒤로
          </button>
        )}

        {/* Step 1: Select Group */}
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
                onClick={() => setStep('selectGame')}
              >
                다음
              </button>
            </div>
          </>
        )}

        {/* Step 2: Select Game & Participants */}
        {step === 'selectGame' && (
          <>
            <h2 className={styles.sectionTitle}>게임 선택</h2>

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

            <div className={styles.amountSection}>
              <h3 className={styles.sectionTitle}>금액</h3>
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

            <div className={styles.participantsSection}>
              <h3 className={styles.sectionTitle}>참가자 선택</h3>
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

        {/* Step 3: Play */}
        {step === 'play' && selectedGameType === 'roulette' && (
          <>
            <h2 className={styles.sectionTitle}>룰렛 돌리기</h2>
            <div className={styles.playArea}>
              <div className={styles.rouletteContainer}>
                <div className={styles.roulettePointer} />
                <div
                  className={styles.roulette}
                  style={{ transform: `rotate(${rouletteRotation}deg)` }}
                >
                  <div className={styles.rouletteInner}>🎯</div>
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

        {step === 'play' && selectedGameType === 'bomb' && (
          <>
            <h2 className={styles.sectionTitle}>폭탄 돌리기</h2>
            <p className={styles.sectionDesc}>
              현재 차례: <strong>{currentPlayerName}</strong>
            </p>
            <div className={styles.bombGrid}>
              {bombCards.map((card, index) => (
                <button
                  key={index}
                  className={`${styles.bombCard} ${card === 'safe' ? styles.bombSafe : ''} ${card === 'bomb' ? styles.bombRevealed : ''}`}
                  onClick={() => revealBombCard(index)}
                  disabled={card !== 'hidden'}
                >
                  {card === 'hidden' && '❓'}
                  {card === 'safe' && '✅'}
                  {card === 'bomb' && '💥'}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 4: Result */}
        {step === 'result' && gameResult && (
          <>
            <div className={styles.resultCard}>
              <div className={styles.resultIcon}>
                {selectedGameType === 'roulette' ? '🎡' : '💥'}
              </div>
              <div className={styles.resultTitle}>게임 종료!</div>
              <div className={styles.resultLoser}>{gameResult.loserName}님이 당첨!</div>
              <div className={styles.resultAmount}>₩{gameResult.amount.toLocaleString()}</div>
              <div className={styles.resultDesc}>정산을 확정하면 자동으로 기록됩니다</div>
            </div>

            <div className={styles.buttonRow}>
              <button className={styles.secondaryBtn} onClick={resetGame}>
                다시 하기
              </button>
              <button
                className={styles.primaryBtn}
                onClick={confirmResult}
                disabled={createGame.isPending}
              >
                {createGame.isPending ? '처리 중...' : '정산 확정'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
