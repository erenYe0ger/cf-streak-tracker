// Function to check login status and initialize the tracker
function init() {
    const authLink = document.querySelector('.lang-chooser a[href^="/profile/"]');
    const signbar = document.querySelector('.lang-chooser');

    if (!authLink) {
        if (signbar) {
            const loginMsg = document.createElement('span');
            loginMsg.textContent = " | Login to Codeforces to see your streak";
            loginMsg.style.color = "gray";
            loginMsg.style.marginLeft = "10px";
            loginMsg.style.fontSize = "12px";
            signbar.appendChild(loginMsg);
        }
        return;
    }

    const handle = authLink.textContent.trim();
    
    fetchStreak(handle).then(streak => {
        injectUI(streak);
    });
}

// Function to fetch submissions and calculate the current streak
async function fetchStreak(handle) {
    try {
        const res = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=500`);
        const data = await res.json();
        
        if (data.status !== 'OK') return 0;

        const submissions = data.result;
        const solvedDates = new Set();

        submissions.forEach(sub => {
            if (sub.verdict === 'OK') {
                const date = new Date(sub.creationTimeSeconds * 1000);
                solvedDates.add(date.toDateString());
            }
        });

        let streak = 0;
        let currentDate = new Date();
        let todayStr = currentDate.toDateString();
        
        currentDate.setDate(currentDate.getDate() - 1);
        let yesterdayStr = currentDate.toDateString();

        let dateToCheck = new Date();

        if (!solvedDates.has(todayStr) && !solvedDates.has(yesterdayStr)) {
            return 0;
        }

        if (!solvedDates.has(todayStr) && solvedDates.has(yesterdayStr)) {
            dateToCheck.setDate(dateToCheck.getDate() - 1);
        }

        while (solvedDates.has(dateToCheck.toDateString())) {
            streak++;
            dateToCheck.setDate(dateToCheck.getDate() - 1);
        }

        return streak;

    } catch (error) {
        console.error("CF Streak Tracker Error:", error);
        return 0;
    }
}

// Function to inject the UI next to the logo
function injectUI(streak) {
    const container = document.createElement('div');
    container.style.display = 'inline-flex';
    container.style.alignItems = 'center';
    
    // Layout adjustments for the top-left position
    container.style.float = 'left'; 
    container.style.marginLeft = '20px'; 
    container.style.marginTop = '15px'; 
    
    container.style.fontWeight = '900'; 
    container.style.fontSize = '22px'; 
    container.style.fontFamily = '"Segoe UI", Roboto, Helvetica, Arial, sans-serif'; 

    const isLit = streak > 0;
    
    // Original light theme colors uniformly applied
    const litColor = '#FFB300'; // Orangish-Yellow
    const unlitColor = '#007bff'; // Classic Blue
    const color = isLit ? litColor : unlitColor;

    // Load local GIFs from the assets folder
    const fireGifURL = chrome.runtime.getURL("assets/fire.gif");
    const iceGifURL = chrome.runtime.getURL("assets/ice.gif");
    
    // Both icons set to 56px
    const iconUnlit = `<img src="${iceGifURL}" style="width: 56px; height: 56px; display: block;">`; 
    const iconLit = `<img src="${fireGifURL}" style="width: 56px; height: 56px; display: block;">`;

    container.innerHTML = `
        <span style="display: flex; align-items: center; justify-content: center; margin-right: 8px;">
            ${isLit ? iconLit : iconUnlit}
        </span>
        <span style="color: ${color}; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">${streak}</span>
    `;

    // Find the div containing the Codeforces logo and inject right after it
    const logoContainer = document.querySelector('#header > div:first-child');
    if (logoContainer) {
        logoContainer.parentNode.insertBefore(container, logoContainer.nextSibling);
    }
}

// Run the script
init();