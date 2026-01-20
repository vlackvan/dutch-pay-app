export interface QuizQuestion {
    id: number;
    question: string;
    answer1: string;
    answer2: string;
    toughAnswer: 1 | 2; // 1 for answer1, 2 for answer2
    explanation: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        id: 1,
        question: "친구가 보낸 메시지를 읽었는데, 대답하기 애매하다.",
        answer1: "안읽씹한다",
        answer2: "카카오톡 반응하기를 남긴다",
        toughAnswer: 1,
        explanation: "사나이는 글자를 읽지 않는다. 기척만 느낀다. 메시지는 약자의 언어고, 침묵은 근육의 대화다. 안 읽어야 친구가 “쟤 아직 살아있구나” 하고 존경한다."
    },
    {
        id: 2,
        question: "여자친구가 집에 혼자 간다고 한다.",
        answer1: "ㅇㅋ, 조심히 들어가",
        answer2: "뭔소리야, 같이 가야지",
        toughAnswer: 2,
        explanation: "사나이는 GPS다. 여자친구 혼자 가면 지구 자전이 불안해진다. 내가 같이 가야 달이 제자리 돈다."
    },
    {
        id: 3,
        question: "일요일에 꼭 일해야 하는데 다같이 놀자고 한다",
        answer1: "가면 감, 쉴땐 쉬어야지",
        answer2: "서진이에게 자신의 바쁨을 강조하면서 싸움을 건다",
        toughAnswer: 1,
        explanation: "사나이는 피곤할수록 논다. 놀고 나서 쓰러져 자는 게 휴식이다. 일요일에 일하면 시계가 나를 무시한다."
    },
    {
        id: 4,
        question: "택시 탔는데 기사님이 말 걸기 시작한다",
        answer1: "맞장구 친다",
        answer2: "잔다",
        toughAnswer: 2,
        explanation: "사나이는 이동 중에 영혼을 충전한다. 입 열면 약해지고, 눈 감으면 강해진다. 코 고는 소리가 “존중합니다”라는 뜻이다."
    },
    {
        id: 5,
        question: "친구가 돈 5천 원 빌려달라 한다.",
        answer1: "빌려준다",
        answer2: "없는 척한다",
        toughAnswer: 1,
        explanation: "5천 원은 돈이 아니다. 동전 덩어리다. 사나이 지갑엔 숫자가 아니라 의리만 있다. 못 받으면? 그건 추억이다."
    },
    {
        id: 6,
        question: "여자친구가 “나 요즘 살찐 거 같지 않아?”라고 묻는다",
        answer1: "아니야, 전혀",
        answer2: "조금?",
        toughAnswer: 1,
        explanation: "사나이는 체중계를 믿지 않는다. 사랑은 중력 무시한다. 살쪘다고 하면 내 무릎이 먼저 부러진다"
    },
    {
        id: 7,
        question: "단톡방에서 네가 한 말만 아무도 답 안 한다.",
        answer1: "다시 말한다",
        answer2: "나간다",
        toughAnswer: 2,
        explanation: "사나이는 읽씹 당하면 퇴장으로 대답한다. 조용히 나가야 전설이 된다. “걔 왜 나갔냐…” 그게 바로 승리다."
    },
    {
        id: 8,
        question: "여자친구가 싸우고 나서 “너 하고 싶은 대로 해”라고 한다.",
        answer1: "진짜 하고 싶은 대로 한다",
        answer2: "사과한다",
        toughAnswer: 2,
        explanation: "사나이는 “하고 싶은 대로” 하면 묻힌다. 살아남고 싶으면 무조건 미안하다. 이유는 나중에 만든다. 먼저 숙이고, 나중에 목을 세운다. 그게 생존술이다."
    },
    {
        id: 9,
        question: "여자친구가 “나랑 일 중에 뭐가 더 중요해?”라고 묻는다.",
        answer1: "너",
        answer2: "상황에 따라 다르지",
        toughAnswer: 1,
        explanation: "일은 월급 주지만, 여친은 잔소리 준다. 잔소리는 사랑이다. 월급은 세금이다. 사나이는 세금보다 사랑을 피한다."
    },
    {
        id: 10,
        question: "여자친구 폰에 모르는 남자 이름 알림이 뜬다.",
        answer1: "못 본 척한다",
        answer2: "누구냐고 묻는다",
        toughAnswer: 2,
        explanation: "사나이는 눈이 있는데 못 본 척하면 장식이다. 궁금하면 묻고, 아니면 벽 보고 팔굽혀펴기 한다. 의심은 근육처럼 키워야 한다."
    },
    {
        id: 11,
        question: "회식 자리에서 정치 얘기가 나온다.",
        answer1: "맞장구친다",
        answer2: "화장실 간다",
        toughAnswer: 2,
        explanation: "사나이는 좌우 안 가른다. 상체만 가른다. 정치 얘기 = 인간관계 팔꿈치 싸움터다. 변기 옆이 제일 평화롭다."
    }
];

export const getRandomQuestion = (): QuizQuestion => {
    const randomIndex = Math.floor(Math.random() * QUIZ_QUESTIONS.length);
    return QUIZ_QUESTIONS[randomIndex];
};
