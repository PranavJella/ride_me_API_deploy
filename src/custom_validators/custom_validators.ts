function isNotEmpty(value: string) {
  if (value.trim().length > 0) {
    return true;
  } else {
    return false;
  }
}

export { isNotEmpty };
