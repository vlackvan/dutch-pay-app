export interface QuizQuestion {
    id: number;
    question: string;
    answer1: string;
    answer2: string;
}

export const quizQuestions: QuizQuestion[] = [
    {
        id: 1,
        question: "친구가 보낸 메시지를 읽었는데, 대답하기 애매하다.",
        answer1: "안읽씹한다",
        answer2: "카카오톡 반응하기를 남긴다",
    },
    {
        id: 2,
        question: "여자친구가 집에 혼자 간다고 한다.",
        answer1: "ㅇㅋ, 조심히 들어가",
        answer2: "뭔소리야, 같이 가야지",
    },
    {
        id: 3,
        question: "일요일에 꼭 일해야 하는데 다같이 놀자고 한다",
        answer1: "가면 감, 쉴땐 쉬어야지",
        answer2: "서진이에게 자신의 바쁨을 강조하면서 싸움을 건다",
    },
    {
        id: 4,
        question: "택시 탔는데 기사님이 말 걸기 시작한다",
        answer1: "맞장구 친다",
        answer2: "잔다",
    },
    {
        id: 5,
        question: "친구가 돈 5천 원 빌려달라 한다.",
        answer1: "빌려준다",
        answer2: "없는 척한다",
    },
    {
        id: 6,
        question: "여자친구가 \"나 요즘 살찐 거 같지 않아?\"라고 묻는다",
        answer1: "아니야, 전혀",
        answer2: "조금?",
    },
    {
        id: 7,
        question: "단톡방에서 네가 한 말만 아무도 답 안 한다.",
        answer1: "다시 말한다",
        answer2: "나간다",
    },
    {
        id: 8,
        question: "여자친구가 싸우고 나서 \"너 하고 싶은 대로 해\"라고 한다.",
        answer1: "진짜 하고 싶은 대로 한다",
        answer2: "사과한다",
    },
    {
        id: 9,
        question: "여자친구가 \"나랑 일 중에 뭐가 더 중요해?\"라고 묻는다.",
        answer1: "너",
        answer2: "상황에 따라 다르지",
    },
    {
        id: 10,
        question: "여자친구 폰에 모르는 남자 이름 알림이 뜬다.",
        answer1: "못 본 척한다",
        answer2: "누구냐고 묻는다",
    },
    {
        id: 11,
        question: "회식 자리에서 정치 얘기가 나온다.",
        answer1: "맞장구친다",
        answer2: "화장실 간다",
    },
];

export function getRandomQuestion(): QuizQuestion {
    const randomIndex = Math.floor(Math.random() * quizQuestions.length);
    return quizQuestions[randomIndex];
}
