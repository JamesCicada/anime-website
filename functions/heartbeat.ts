export default function sendHeartBeat() {
    beat()
    setInterval(() => {
        beat()
    }, 1000 * 60 * 5);
}
function beat() {
  fetch(
    `https://uptime.betterstack.com/api/v1/heartbeat/Zt9uPAaovu9itnVLsRDBZ5v2`
  )
    .then(() => {
      console.log("heart beat sent");
    })
    .catch(console.log);
}
