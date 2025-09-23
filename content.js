const header = document.querySelector("#header");

const handle = header.querySelector("a[href*='/profile/']")?.textContent;
if (!handle) return;

header.style.display = "flex";
header.style.alignItems = "center";
header.style.justifyContent = "space-between";

const div = document.createElement("div");
div.id = "streak";
div.style.display = "flex";
div.style.alignItems = "center";
div.style.marginRight = "30px";
div.style.marginLeft = "auto";
div.style.cursor = "pointer";
div.title = "Your current streak";

header.insertBefore(div, header.children[1]);

const updateDiv = (streak) => {
    div.innerHTML = `
        <img src="${chrome.runtime.getURL(
            streak > 0 ? "icons/on.svg" : "icons/off.svg"
        )}" style="width:20px; height:20px; margin-right:5px;">
        <span style="font-size:16px; font-weight:bold;">${streak}</span>
    `;
};

const today5AM = () => {
    const now = new Date();
    const today5AM = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        5,
        0,
        0
    );
    if (now < today5AM) today5AM.setDate(today5AM.getDate() - 1);
    return Math.floor(today5AM.getTime() / 1000);
};

const fetchStreak = async () => {
    let from = 1;
    const batchSize = 100;
    let streak = 0;
    let curentDay = today5AM();
    let foundAC = false;
    const oneDay = 86400;

    while (true) {
        const response = await fetch(
            `https://codeforces.com/api/user.status?handle=${handle}&from=${from}&count=${batchSize}`
        );
        const data = await response.json();
        if (data.status !== "OK") return streak;

        const submissions = data.result;
        if (submissions.length === 0) return streak;

        for (const submission of submissions) {
            const t = submission.creationTimeSeconds;
            if (foundAC && t >= curentDay) continue;
            if (foundAC && t < curentDay) {
                if (t >= curentDay - oneDay) {
                    streak++;
                    curentDay -= oneDay;
                    foundAC = submission.verdict === "OK";
                } else return streak;
            }
            if (!foundAC && t < curentDay) return streak;
            if (!foundAC && t >= curentDay)
                foundAC = submission.verdict === "OK";
        }

        from += batchSize;
    }
};

window.addEventListener("load", async () => {
    const streak = await fetchStreak();
    updateDiv(streak);
});
