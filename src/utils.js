function generateUID() {
  /*
   * http://dicom.nema.org/medical/dicom/current/output/chtml/part05/sect_B.2.html
   * https://www.itu.int/rec/T-REC-X.667-201210-I/en
   *  A UUID can be represented as a single integer value.
   * To obtain the single integer value of the UUID, the 16 octets of the
   * binary representation shall be treated as an unsigned integer encoding
   * with the most significant bit of the integer encoding as the most
   * significant bit (bit 7) of the first of the sixteen octets (octet 15) and
   * the least significant bit as the least significant bit (bit 0) of the last
   * of the sixteen octets (octet 0).
  */
  // FIXME: This is not a valid UUID!
  let uid = '2.25.' + Math.floor(1 + Math.random() * 9);
  while (uid.length < 44) {
    uid += Math.floor(1 + Math.random() * 10);
  }
  return uid;
}

export { generateUID };
