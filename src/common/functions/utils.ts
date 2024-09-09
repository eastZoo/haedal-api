/**
 * - 값이 null, undefined, 빈 문자열, 빈 배열, 빈 객체인지 확인
 * @param value
 * @returns {boolean}
 */
export const isNotEmpty = (value: any): boolean => {
  if (value == null) {
    return false;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return false;
  }

  if (Array.isArray(value) && value.length === 0) {
    return false;
  }

  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return false;
  }

  return true;
};
