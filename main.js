const setPartnerCookie=(hostDomain, APIURL)=>{
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

    function setCookie(cookieName, cookieValue) {
        Cookies.set(cookieName, cookieValue, {expires: 30, path: '/', origin: `${hostDomain}`})
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

    // if(Cookies.get('affiliate_ref') && Cookies.get('affiliate_source')){
    if(params['affiliate_ref'] && params['affiliate_source']){
        fetch(`${APIURL}/api/partners/cookies`, {
            method:'POST',
            body: JSON.stringify({
                "affiliate_ref": params['affiliate_ref'],
                "affiliate_source": params['affiliate_source']
            }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then(res => {
            return res.json()
        }).then(res=> {
                setCookie('affiliate_uuid', res.results.uuid);
            })
    }
}
