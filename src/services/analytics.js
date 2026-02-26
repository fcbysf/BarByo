import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const initGA = () => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    console.log("GA initialized with ID:", GA_MEASUREMENT_ID);
  } else {
    console.warn("GA Measurement ID not found. Analytics disabled.");
  }
};

export const trackPageView = (path) => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.send({
      hitType: "pageview",
      page: path || window.location.pathname,
    });
  }
};

export const trackEvent = (category, action, label) => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.event({
      category: category,
      action: action,
      label: label,
    });
  }
};
