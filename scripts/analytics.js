// Analytics Configuration
const mixpanel = window.mixpanel;

// Initialize Mixpanel
mixpanel.init('9039ae7df20c5c6d7fad91acb84ac442', {
    debug: false, // Set to false for production
    track_pageview: true,
    persistence: 'localStorage'
});

// Sample tracking URLs (for reference):
/*
Instagram: yoursite.com/?utm_source=instagram&utm_medium=social&utm_campaign=mental_health&utm_content=user_1
Twitter: yoursite.com/?utm_source=twitter&utm_medium=social&utm_campaign=mental_health&utm_content=user_1
Facebook: yoursite.com/?utm_source=facebook&utm_medium=social&utm_campaign=mental_health&utm_content=user_1
Physical Location: yoursite.com/?utm_source=poster&utm_medium=offline&utm_campaign=mental_health&utm_content=location_[1-3]
*/

// Function to get URL parameters
function getUrlParams() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams) {
        params[key] = value;
    }
    return params;
}

// Function to extract user or location from UTM content
function extractTrackingInfo(utmContent) {
    if (!utmContent) return { type: 'unknown', value: 'none' };
    
    const [type, value] = utmContent.split('_');
    return { type, value };
}

// Function to track UTM parameters with enhanced stratification
export function trackUTMParameters() {
    const params = getUrlParams();
    const utmParams = {
        utm_source: params.utm_source || '(direct)',
        utm_medium: params.utm_medium || '(none)',
        utm_campaign: params.utm_campaign || '(not set)',
        utm_content: params.utm_content || '(not set)',
        utm_term: params.utm_term || '(not set)'
    };

    // Extract tracking info
    const { type, value } = extractTrackingInfo(utmParams.utm_content);

    // Enhanced tracking properties
    const trackingProperties = {
        ...utmParams,
        url: window.location.href,
        path: window.location.pathname,
        referrer: document.referrer,
        channel_type: utmParams.utm_source,
        tracking_type: type,
        tracking_value: value,
        is_social: ['instagram', 'twitter', 'facebook'].includes(utmParams.utm_source),
        is_offline: utmParams.utm_medium === 'offline',
        visit_timestamp: new Date().toISOString()
    };

    // Track page visit with enhanced parameters
    mixpanel.track('Page Visit', trackingProperties);

    // Set user properties for better segmentation
    mixpanel.people.set({
        'Last UTM Source': utmParams.utm_source,
        'Last UTM Medium': utmParams.utm_medium,
        'Last UTM Campaign': utmParams.utm_campaign,
        'Last Channel Type': utmParams.utm_source,
        'Last Tracking Type': type,
        'Last Tracking Value': value,
        '$last_seen': new Date()
    });

    // Set super properties for consistent tracking
    mixpanel.register({
        'Channel Type': utmParams.utm_source,
        'Tracking Type': type,
        'Tracking Value': value
    });
}

// Function to track user interactions with enhanced properties
export function trackEvent(eventName, properties = {}) {
    const params = getUrlParams();
    const { type, value } = extractTrackingInfo(params.utm_content);

    mixpanel.track(eventName, {
        ...properties,
        channel_type: params.utm_source || '(direct)',
        tracking_type: type,
        tracking_value: value,
        timestamp: new Date(),
        is_social: ['instagram', 'twitter', 'facebook'].includes(params.utm_source),
        is_offline: params.utm_medium === 'offline'
    });
}

// Function to track form submissions with enhanced properties
export function trackFormSubmission(formType, success = true) {
    const params = getUrlParams();
    const { type, value } = extractTrackingInfo(params.utm_content);

    mixpanel.track('Form Submission', {
        form_type: formType,
        success: success,
        channel_type: params.utm_source || '(direct)',
        tracking_type: type,
        tracking_value: value,
        utm_source: params.utm_source || '(direct)',
        utm_medium: params.utm_medium || '(none)',
        utm_campaign: params.utm_campaign || '(not set)',
        is_social: ['instagram', 'twitter', 'facebook'].includes(params.utm_source),
        is_offline: params.utm_medium === 'offline'
    });
}

// Function to identify users with enhanced properties
export function identifyUser(email, properties = {}) {
    const params = getUrlParams();
    const { type, value } = extractTrackingInfo(params.utm_content);

    mixpanel.identify(email);
    mixpanel.people.set({
        '$email': email,
        'Channel Type': params.utm_source || '(direct)',
        'Tracking Type': type,
        'Tracking Value': value,
        ...properties
    });
} 