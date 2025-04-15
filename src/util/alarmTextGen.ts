// 생성된 데이터에 따라 푸시알람 텍스트 생성 함수

export const alarmTextGen = (category: string, data: any) => {
  if (category === 'calendar') {
    return `새로운 일정이 등록되었습니다. ${data.title} (${data.startDate})`;
  }
};
