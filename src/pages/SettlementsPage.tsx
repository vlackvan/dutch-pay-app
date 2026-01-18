import { useEffect, useMemo, useState } from 'react';
import styles from './settlements/SettlementsPage.module.css';
import { useNavigate } from 'react-router-dom';
import { useMyGroups, useCreateGroup, useJoinGroup, useGetInviteGroup } from '@/hooks/queries/useGroups';
import { useAuthStore } from '@/stores/auth.store';
import type { InviteGroupResponse } from '@/types/api.types';

type SheetMode = 'closed' | 'menu' | 'create' | 'join' | 'invite';

export default function SettlementsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const { data: groups = [], isLoading, error } = useMyGroups();
  const createGroupMutation = useCreateGroup();
  const joinGroupMutation = useJoinGroup();
  const inviteLookup = useGetInviteGroup();

  const [sheet, setSheet] = useState<SheetMode>('closed');

  const [groupTitle, setGroupTitle] = useState('');
  const [groupIcon, setGroupIcon] = useState('🏖️');
  const [groupDescription, setGroupDescription] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);

  const [inviteCode, setInviteCode] = useState('');
  const [inviteGroup, setInviteGroup] = useState<InviteGroupResponse | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [createdGroupId, setCreatedGroupId] = useState<number | null>(null);
  const [createdGroupName, setCreatedGroupName] = useState('');
  const [createdInviteCode, setCreatedInviteCode] = useState('');
  const [createdParticipants, setCreatedParticipants] = useState<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheet('closed');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openMenu = () => setSheet('menu');

  const resetForms = () => {
    setGroupTitle('');
    setGroupIcon('???');
    setGroupDescription('');
    setParticipants(user?.name ? [user.name] : ['']);
    setInviteCode('');
    setInviteGroup(null);
    setSelectedParticipantId(null);
    setNewParticipantName('');
    setCreatedGroupId(null);
    setCreatedGroupName('');
    setCreatedInviteCode('');
    setCreatedParticipants([]);
  };

  const closeAll = () => {
    setSheet('closed');
    resetForms();
  };

  const goMenu = () => setSheet('menu');
  const goCreate = () => {
    setParticipants(user?.name ? [user.name] : ['']);
    setSheet('create');
  };
  const goJoin = () => {
    setInviteGroup(null);
    setSelectedParticipantId(null);
    setNewParticipantName('');
    setSheet('join');
  };

  const goToCreatedGroup = () => {
    if (!createdGroupId) return;
    const nextId = createdGroupId;
    closeAll();
    navigate(`/settlements/${nextId}`);
  };

  const updateParticipant = (index: number, value: string) => {
    setParticipants((prev) => prev.map((name, i) => (i === index ? value : name)));
  };

  const addParticipant = () => {
    setParticipants((prev) => [...prev, '']);
  };

  const removeParticipant = (index: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  const canCreate = useMemo(() => {
    const hasParticipants = participants.some((name) => name.trim());
    return groupTitle.trim().length > 0 && hasParticipants;
  }, [groupTitle, participants]);

  const createGroup = () => {
    if (!canCreate) return;

    const participantNames = participants.map((name) => name.trim()).filter(Boolean);

    createGroupMutation.mutate(
      {
        name: groupTitle.trim(),
        description: groupDescription.trim() || undefined,
        icon: groupIcon,
        participants: participantNames,
      },
      {
        onSuccess: (newGroup) => {
          setCreatedGroupId(newGroup.id);
          setCreatedGroupName(newGroup.name);
          setCreatedInviteCode(newGroup.invite_code);
          setCreatedParticipants(participantNames);
          setSheet('invite');
        },
      }
    );
  };

  const joinGroup = () => {
    if (!inviteCode.trim()) return;

    if (!inviteGroup) {
      inviteLookup.mutate(inviteCode.trim(), {
        onSuccess: (data) => {
          setInviteGroup(data);
        },
      });
      return;
    }

    const payload = { invite_code: inviteCode.trim() } as {
      invite_code: string;
      participant_id?: number;
      participant_name?: string;
    };

    if (selectedParticipantId) {
      payload.participant_id = selectedParticipantId;
    } else if (newParticipantName.trim()) {
      payload.participant_name = newParticipantName.trim();
    } else {
      return;
    }

    joinGroupMutation.mutate(payload, {
      onSuccess: (joinedGroup) => {
        closeAll();
        navigate(`/settlements/${joinedGroup.id}`);
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.logoRow}>
            <div className={styles.logo}>Dutch Pay</div>
          </div>
        </header>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.logoRow}>
            <div className={styles.logo}>Dutch Pay</div>
          </div>
        </header>
        <div className={styles.error}>그룹을 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logoRow}>
          <div className={styles.logo}>Dutch Pay</div>
          {user && <div className={styles.by}>{user.name}님</div>}
        </div>
      </header>

            <main className={styles.list}>
        <div className={styles.boardFrame}>
          <div className={styles.paperPanel}>

            {groups.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>📋</div>
                <div className={styles.emptyText}>아직 참여한 그룹이 없습니다</div>
                <div className={styles.emptyHint}>새 그룹을 만들거나 초대 코드로 참여해보세요</div>
              </div>
            ) : (
              groups.map((g) => (
                <button
                  key={g.id}
                  className={styles.card}
                  type="button"
                  onClick={() => navigate(`/settlements/${g.id}`)}
                >
                  <div className={styles.left}>
                    <div className={styles.emoji} aria-hidden="true">
                      {g.icon || '🧾'}
                    </div>

                    <div className={styles.text}>
                      <div className={styles.title}>{g.name}</div>
                      <div className={styles.meta}>
                        <span>{formatDate(g.created_at)}</span>
                        <span className={styles.dot}>•</span>
                        <span>{g.member_count}명</span>
                      </div>
                    </div>
                  </div>

                  {g.unsettled_amount > 0 && (
                    <div className={styles.unsettled}>₩{g.unsettled_amount.toLocaleString()}</div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </main>

      <button className={styles.fab} type="button" aria-label="새 그룹 만들기" onClick={openMenu}>
        +
      </button>
      <button className={styles.fabLabel} type="button" onClick={openMenu}>
        새 그룹 만들기
      </button>

      {sheet !== 'closed' && (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <div className={styles.backdrop} onClick={closeAll} />

          {sheet === 'menu' && (
            <div className={styles.sheet}>
              <div className={styles.sheetHeader}>
                <button className={styles.closeX} onClick={closeAll} aria-label="닫기">
                  ×
                </button>
                <div className={styles.sheetTitleCenter}>추가</div>
                <div />
              </div>

              <div className={styles.sheetBody}>
                <button className={styles.sheetItem} type="button" onClick={goCreate}>
                  <div className={`${styles.sheetIconCircle} ${styles.blueCircle}`}>
                    <span className={styles.iconPlus}>+</span>
                  </div>
                  <div className={styles.sheetItemText}>
                    <div className={styles.sheetItemTitle}>새 그룹 만들기</div>
                    <div className={styles.sheetItemSub}>새로운 정산 그룹을 만들어요.</div>
                  </div>
                  <div className={styles.sheetChev}>›</div>
                </button>

                <button className={styles.sheetItem} type="button" onClick={goJoin}>
                  <div className={`${styles.sheetIconCircle} ${styles.greenCircle}`}>
                    <span className={styles.iconLink}>🔗</span>
                  </div>
                  <div className={styles.sheetItemText}>
                    <div className={styles.sheetItemTitle}>이미 있는 그룹에 참여하기</div>
                    <div className={styles.sheetItemSub}>초대 코드로 그룹에 참여해요.</div>
                  </div>
                  <div className={styles.sheetChev}>›</div>
                </button>
              </div>
            </div>
          )}

          {sheet === 'create' && (
            <div className={styles.sheetFull}>
              <div className={styles.navBar}>
                <button className={styles.navLeft} onClick={goMenu} type="button">
                  취소
                </button>
                <div className={styles.navTitle}>그룹 추가</div>
                <div />
              </div>

              <div className={styles.form}>
                <div className={styles.sectionTitle}>이름</div>
                <div className={styles.rowField}>
                  <div className={styles.smallIconBox} aria-hidden="true">
                    {groupIcon}
                  </div>
                  <input
                    className={styles.input}
                    placeholder="예: 여름 여행"
                    value={groupTitle}
                    onChange={(e) => setGroupTitle(e.target.value)}
                  />
                </div>

                <div className={styles.sectionTitle}>아이콘</div>
                <div className={styles.emojiRow}>
                  {['🏖️', '🍀', '🍻', '✈️', '🏠', '🎮', '🎉', '💼'].map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`${styles.emojiBtn} ${groupIcon === icon ? styles.emojiBtnActive : ''}`}
                      onClick={() => setGroupIcon(icon)}
                    >
                      {icon}
                    </button>
                  ))}
                </div>

                <div className={styles.sectionTitle}>설명 (선택)</div>
                <input
                  className={styles.input}
                  placeholder="예: 2024년 여름 제주 여행 경비 정산"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                />

                <div className={styles.sectionTitle}>Participants</div>
                <div className={styles.participantsBox}>
                  {participants.map((name, index) => (
                    <div key={`p-${index}`} className={styles.participantRow}>
                      <input
                        className={styles.participantInput}
                        placeholder="Name"
                        value={name}
                        onChange={(e) => updateParticipant(index, e.target.value)}
                      />
                      {index === 0 ? (
                        <span className={styles.meBadge}>Me</span>
                      ) : (
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => removeParticipant(index)}
                          aria-label="Remove participant"
                        >
                          -
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className={styles.addAnother} onClick={addParticipant}>
                    Add another participant
                  </button>
                </div>

                <button
                  className={`${styles.primaryBtn} ${!canCreate || createGroupMutation.isPending ? styles.disabled : ''}`}
                  type="button"
                  onClick={createGroup}
                  disabled={!canCreate || createGroupMutation.isPending}
                >
                  {createGroupMutation.isPending ? '생성 중...' : '그룹 만들기'}
                </button>

                {createGroupMutation.isError && (
                  <div className={styles.errorMsg}>그룹 생성에 실패했습니다. 다시 시도해주세요.</div>
                )}
              </div>
            </div>
          )}

          {sheet === 'join' && (
            <div className={styles.sheetFull}>
              <div className={styles.navBar}>
                <button className={styles.navLeft} onClick={goMenu} type="button">
                  취소
                </button>
                <div className={styles.navTitle}>그룹 참여</div>
                <div />
              </div>

              <div className={styles.joinWrap}>
                <div className={styles.joinIcon} aria-hidden="true">
                  🔗
                </div>
                <div className={styles.joinTitle}>그룹에 참여하기</div>
                <div className={styles.joinDesc}>다른 참여자에게서 초대 코드를 받아 입력해 주세요.</div>

                <div className={styles.sectionTitle}>초대 코드</div>
                <input
                  className={styles.input}
                  placeholder="초대 코드 입력"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value);
                    setInviteGroup(null);
                    setSelectedParticipantId(null);
                    setNewParticipantName('');
                  }}
                />

                {inviteGroup && (
                  <>
                    <div className={styles.sectionTitle}>Group</div>
                    <div className={styles.participantName}>{inviteGroup.group_name}</div>

                    <div className={styles.sectionTitle}>Choose participant</div>
                    <div className={styles.participantsBox}>
                      {inviteGroup.participants.map((p) => (
                        <label key={p.id} className={styles.participantRow}>
                          <input
                            type="radio"
                            name="participant"
                            disabled={p.is_claimed}
                            checked={selectedParticipantId === p.id}
                            onChange={() => {
                              setSelectedParticipantId(p.id);
                              setNewParticipantName('');
                            }}
                          />
                          <span className={styles.participantName}>{p.name}</span>
                          {p.is_claimed && <span className={styles.meBadge}>Claimed</span>}
                        </label>
                      ))}
                    </div>

                    <div className={styles.sectionTitle}>Or add yourself</div>
                    <input
                      className={styles.input}
                      placeholder="Name"
                      value={newParticipantName}
                      onChange={(e) => {
                        setNewParticipantName(e.target.value);
                        if (e.target.value) {
                          setSelectedParticipantId(null);
                        }
                      }}
                    />
                  </>
                )}

                <button
                  className={`${styles.primaryBtn} ${(!inviteCode.trim() || joinGroupMutation.isPending || inviteLookup.isPending || (inviteGroup ? !(selectedParticipantId || newParticipantName.trim()) : false)) ? styles.disabled : ''}`}
                  type="button"
                  onClick={joinGroup}
                  disabled={!inviteCode.trim() || joinGroupMutation.isPending || inviteLookup.isPending || (inviteGroup ? !(selectedParticipantId || newParticipantName.trim()) : false)}
                >
                  {inviteGroup
                    ? joinGroupMutation.isPending ? '참여 중...' : '참여'
                    : inviteLookup.isPending ? '불러오는 중...' : '다음'}
                </button>

                {joinGroupMutation.isError && (
                  <div className={styles.errorMsg}>그룹 참여에 실패했습니다. 초대 코드를 확인해주세요.</div>
                )}
              </div>
            </div>
          )}

          {sheet === 'invite' && (
            <div className={styles.sheetFull}>
              <div className={styles.navBar}>
                <button className={styles.navLeft} onClick={closeAll} type="button">
                  닫기
                </button>
                <div className={styles.navTitle}>초대하기</div>
                <div />
              </div>

              <div className={styles.inviteWrap}>
                <div className={styles.inviteIcon} aria-hidden="true">
                  🎉
                </div>
                <div className={styles.inviteTitle}>당신의 그룹은 사용할 준비가 되었습니다!</div>
                <div className={styles.inviteDesc}>
                  아래 초대 코드로 참여자를 초대하세요.
                </div>

                <div className={styles.sectionTitle}>Participants</div>
                <div className={styles.participantsBox}>
                  {createdParticipants.map((name, index) => (
                    <div key={`created-${index}`} className={styles.participantRow}>
                      <span className={styles.participantName}>{name}</span>
                      {index === 0 && <span className={styles.meBadge}>Me</span>}
                    </div>
                  ))}
                </div>

                <div className={styles.sectionTitle}>초대 코드</div>
                <div className={styles.inviteCodeBox}>
                  <span className={styles.inviteCodeText}>{createdInviteCode}</span>
                </div>

                <button className={styles.primaryBtn} type="button" onClick={goToCreatedGroup}>
                  {createdGroupName ? `${createdGroupName}로 이동` : '그룹으로 이동'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
