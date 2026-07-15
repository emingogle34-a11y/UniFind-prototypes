export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 10;
export const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]+$/;

export const BANNED_NICKNAME_WORDS = [
  "admin",
  "administrator",
  "unifind",
  "운영자",
  "관리자",
  "시발",
  "병신",
  "fuck",
  "shit",
];

export type NicknameValidationResult = {
  nickname: string;
  valid: boolean;
  message: string;
};

export function validateNickname(value: string): NicknameValidationResult {
  const nickname = value.trim();

  if (nickname.length < NICKNAME_MIN_LENGTH || nickname.length > NICKNAME_MAX_LENGTH) {
    return {
      nickname,
      valid: false,
      message: `닉네임은 ${NICKNAME_MIN_LENGTH}~${NICKNAME_MAX_LENGTH}자로 입력해주세요.`,
    };
  }

  if (!NICKNAME_REGEX.test(nickname)) {
    return {
      nickname,
      valid: false,
      message: "한글, 영문, 숫자만 사용할 수 있어요.",
    };
  }

  const lowerNickname = nickname.toLowerCase();
  const hasBannedWord = BANNED_NICKNAME_WORDS.some((word) =>
    lowerNickname.includes(word.toLowerCase())
  );

  if (hasBannedWord) {
    return {
      nickname,
      valid: false,
      message: "사용할 수 없는 표현이 포함되어 있어요.",
    };
  }

  return {
    nickname,
    valid: true,
    message: "사용 가능한 형식이에요.",
  };
}
