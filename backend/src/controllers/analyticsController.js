import URL from "../models/Url.js";

const buildAnalyticsSummary = (clicks) => {
  const summary = {
    totalClicks: clicks.length,
    countries: {},
    browsers: {},
    devices: {},
    days: {},
    recentClicks: clicks.slice(-20).reverse(),
  };

  clicks.forEach((click) => {
    const country = click.country || "Unknown";
    summary.countries[country] = (summary.countries[country] || 0) + 1;

    const browser = click.browser || "Unknown";
    summary.browsers[browser] = (summary.browsers[browser] || 0) + 1;

    const device = click.device || "Unknown";
    summary.devices[device] = (summary.devices[device] || 0) + 1;

    const day = new Date(click.clickedAt).toISOString().slice(0, 10);
    summary.days[day] = (summary.days[day] || 0) + 1;
  });

  return summary;
};

export const getAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const urlDoc = await URL.findOne({
      _id: id,
      createdBy: req.user._id,
    });

    if (!urlDoc) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    const summary = buildAnalyticsSummary(urlDoc.clicks || []);

    return res.status(200).json({
      success: true,
      analytics: {
        totalClicks: urlDoc.totalClicks,
        recentClicks: summary.recentClicks,
        countryStats: summary.countries,
        browserStats: summary.browsers,
        deviceStats: summary.devices,
        dailyTrend: Object.entries(summary.days).map(([date, count]) => ({ date, count })),
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
};
