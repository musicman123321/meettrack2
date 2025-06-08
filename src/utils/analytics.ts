// Simple analytics utility for tracking user interactions
// This is a basic implementation - in production you might use Google Analytics, Mixpanel, etc.

interface AnalyticsEvent {
  event: string;
  category: string;
  label?: string;
  value?: number;
  userId?: string;
}

class Analytics {
  private isEnabled: boolean;
  private userId?: string;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === "production";
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  track(event: AnalyticsEvent) {
    if (!this.isEnabled) {
      console.log("[Analytics - Dev]", event);
      return;
    }

    try {
      // In a real implementation, you would send this to your analytics service
      // For now, we'll just log it and store in localStorage for debugging
      const eventData = {
        ...event,
        userId: this.userId,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      console.log("[Analytics]", eventData);

      // Store recent events in localStorage for debugging (limit to last 100)
      const events = JSON.parse(
        localStorage.getItem("analytics_events") || "[]",
      );
      events.push(eventData);
      if (events.length > 100) {
        events.shift();
      }
      localStorage.setItem("analytics_events", JSON.stringify(events));
    } catch (error) {
      console.error("Analytics error:", error);
    }
  }

  // Specific tracking methods for common events
  trackDonationClick(amount?: number) {
    this.track({
      event: "donation_click",
      category: "engagement",
      label: "donation_button",
      value: amount,
    });
  }

  trackDonationComplete(amount: number) {
    this.track({
      event: "donation_complete",
      category: "conversion",
      label: "donation_success",
      value: amount,
    });
  }

  trackFeatureUsage(feature: string) {
    this.track({
      event: "feature_usage",
      category: "engagement",
      label: feature,
    });
  }

  trackError(error: string, context?: string) {
    this.track({
      event: "error",
      category: "error",
      label: error,
      value: context ? 1 : 0,
    });
  }

  trackPageView(page: string) {
    this.track({
      event: "page_view",
      category: "navigation",
      label: page,
    });
  }

  trackUserAction(action: string, context?: string) {
    this.track({
      event: "user_action",
      category: "interaction",
      label: action,
      value: context ? 1 : 0,
    });
  }
}

export const analytics = new Analytics();
