
// convert a duration in XXminYYs
humanizeDuration = duration => {
  let str = ''; 
  if (duration >= 60) {
    const mn = duration / 60 | 0;
    str += `${mn}min`;
    duration -= mn * 60;
  }
  str += `${duration | 0}s`;
  return str;
}
