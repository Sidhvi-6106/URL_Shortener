import geoip from "geoip-lite";

import detectDevice from "../utils/detectDevice.js";



const generateAnalyticsData = (
  req
) => {
  const forwardedFor =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim();

  const ip =
    forwardedFor ||
    req.socket.remoteAddress ||
    "";

  const geo = geoip.lookup(ip);

  const userAgent =
    req.headers["user-agent"];

  const deviceInfo =
    detectDevice(userAgent);

  return {
    ipAddress: ip,

    country:
      geo?.country || "Unknown",

    city: geo?.city || "Unknown",

    browser:
      deviceInfo.browser,

    os: deviceInfo.os,

    device: deviceInfo.device,

    clickedAt: new Date(),
  };
};

export default generateAnalyticsData;
