const setCookies = function (apiUrl, cookieDomain = '.loqbox.com') {
    const cookiesList = {
        refer: 'loqbox_refer',
        code: 'referral_code',
        click_id: ['loqbox_click_id', 'affiliate_external_ref'],
        aff: 'affiliate_ref',
        dept: 'affiliate_source',
        affiliate_ref: 'affiliate_ref',
        affiliate_source: 'affiliate_source',
        referral_code: 'referral_code',
        referral_channel: 'referral_channel'
    };

    function getCookie(name) {
        let value = `; ${document.cookie}`;
        let parts = value.split(`; ${name}=`);

        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    function setCookie(cookieName, cookieValue, days = 30) {
        let today = new Date();
        let expiryDate = new Date(today.setDate(today.getDate() + days)).toUTCString();

        document.cookie = `${cookieName}=${cookieValue};expires=${expiryDate};path=/;origin=${cookieDomain};`
    }

    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    // Set `loqbox_track` if URL has both aff and dept or just aff
    if (params['aff'] && params['dept']) {
        setCookie('loqbox_track', params['aff'] + params['dept']);
    } else if (params['aff']) {
        setCookie('loqbox_track', params['aff']);
    }

    for (var key in params) {
        if (cookiesList[key]) {
            if (Array.isArray(cookiesList[key])) {
                for (let i = 0; i < cookiesList[key].length; i++) {
                    setCookie(cookiesList[key][i], params[key]);
                }
            } else {
                setCookie(cookiesList[key], params[key]);
            }
        } else {
            setCookie(key, params[key]);
        }
    }

    if (params['affiliate_source'] || params['dept']) {
        const previousUuid = getCookie('affiliate_uuid');

        fetch(`${apiUrl}/api/partners/cookies`, {
            method: 'POST',
            body: JSON.stringify({
                'affiliate_ref': params['affiliate_ref'] ?? params['aff'] ?? null,
                'affiliate_source': params['affiliate_source'] ?? params['dept'],
                'previous_uuid': previousUuid && previousUuid.length === 36 ? previousUuid : null,
                'affiliate_external_ref': params['affiliate_external_ref'] ?? params['click_id'] ?? null,
                'affiliate_external_ref_2': params['affiliate_external_ref_2'] ?? null,
                'affiliate_external_ref_3': params['affiliate_external_ref_3'] ?? null,
                'affiliate_external_ref_4': params['affiliate_external_ref_4'] ?? null
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(res => {
            const json = res.json();
            if (!res.ok) {
                throw new Error(json.message ?? 'Something went wrong.');
            }
            return json;
        }).then(res => {
            setCookie('affiliate_uuid', res.results.uuid);
        }).catch(err => {
            // Do nothing
        });
    }
}
