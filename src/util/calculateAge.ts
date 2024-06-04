export const calculateAge = async (birthdate: string) => {
  // 생일 문자열을 날짜 객체로 변환
  const birthDate = new Date(birthdate);
  const today = new Date();

  // 현재 년도와 생년 비교
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  // 생일이 아직 오지 않았다면 나이에서 1을 뺀다
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
};
