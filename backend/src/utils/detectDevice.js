import { UAParser } from "ua-parser-js";

const detectDevice = (
  userAgent
) => {

  const parser =
    new UAParser(userAgent);

  const result =
    parser.getResult();



  return {
    browser:
      result.browser.name || "Unknown",

    os:
      result.os.name || "Unknown",

    device:
      result.device.type || "Desktop",
  };
};

export default detectDevice;