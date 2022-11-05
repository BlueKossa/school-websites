const randomBetween = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

setInterval(() => {
    const r = randomBetween(0, 255);
    const g = randomBetween(0, 255);
    const b = randomBetween(0, 255);
    const a = randomBetween(0, 255);
    const rgb = `rgba(${r},${g},${b},${a})`;
    document.body.style.backgroundColor = rgb;
    }, 100);