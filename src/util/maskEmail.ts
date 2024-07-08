export async function maskEmail(email: string) {
  // "@" 위치를 찾음
  const atIndex = email.indexOf('@');

  // "@" 앞에 나오는 문자열을 추출
  const username = email.slice(0, atIndex);

  // 그 문자열의 절반 길이를 계산
  const halfLength = Math.floor(username.length / 2);

  // 앞부분과 뒷부분을 나눔
  const firstHalf = username.slice(0, halfLength);
  const secondHalf = username.slice(halfLength);

  // 뒷부분을 "*"로 바꿈
  const maskedPart = '*'.repeat(secondHalf.length);

  // 새로운 문자열을 만듦
  const maskedEmail = firstHalf + maskedPart + email.slice(atIndex);

  return maskedEmail;
}
