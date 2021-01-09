import lineStationRelationship from "./lineStationRelationship";

export default function findLineIDByStationCode(code) {
  for (const { line, station } of lineStationRelationship) {
    if (station.includes(code)) {
      return line;
    }
  }
}
