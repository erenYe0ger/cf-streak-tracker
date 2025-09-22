const header = document.querySelector("#header");
header.style.display = "flex";
header.style.alignItems = "center";
header.style.justifyContent = "space-between";

const div = document.createElement("div");
div.id = "streak";
div.style.display = "flex";
div.style.alignItems = "center";
div.style.marginRight = "30px";
div.style.marginLeft = "auto";

chrome.storage.local.get(["streak", "solvedToday"], (result) => {
    const streakCount = result.streak ?? 0;
    const solvedToday = result.solvedToday ?? false;
    div.innerHTML = `
        <img src="${chrome.runtime.getURL(
            solvedToday ? "icons/on.svg" : "icons/off.svg"
        )}" style="width:20px; height:20px; margin-right:5px;">
        <span style="font-size:16px; font-weight:bold;">${streakCount}</span>
    `;
});

header.insertBefore(div, header.children[1]);
