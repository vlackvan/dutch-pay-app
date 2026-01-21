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
        question: "일요일에 꼭 일해야 하는데 다같이 놀자고 한다",
        answer1: "가면 감, 쉴땐 쉬어야지",
        answer2: "서진이에게 자신의 바쁨을 강조하면서 싸움을 건다",
        toughAnswer: 1,
        explanation: "사나이는 피곤할수록 논다. 놀고 나서 쓰러져 자는 게 휴식이다. 일요일에 일하면 시계가 나를 무시한다."
    },
    {
        id: 3,
        question: "택시 탔는데 기사님이 말 걸기 시작한다",
        answer1: "맞장구 친다",
        answer2: "잔다",
        toughAnswer: 2,
        explanation: "사나이는 이동 중에 영혼을 충전한다. 입 열면 약해지고, 눈 감으면 강해진다. 코 고는 소리가 “존중합니다”라는 뜻이다."
    },
    {
        id: 4,
        question: "단톡방에서 네가 한 말만 아무도 답 안 한다.",
        answer1: "다시 말한다",
        answer2: "나간다",
        toughAnswer: 2,
        explanation: "사나이는 읽씹 당하면 퇴장으로 대답한다. 조용히 나가야 전설이 된다. “걔 왜 나갔냐…” 그게 바로 승리다."
    },
];

export const getRandomQuestion = (): QuizQuestion => {
    const randomIndex = Math.floor(Math.random() * QUIZ_QUESTIONS.length);
    return QUIZ_QUESTIONS[randomIndex];
};
