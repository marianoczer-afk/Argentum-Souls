export const stationCost=level=>45*(level+1)**2;
export function buyStation(state,mode,allowed=true){if(!allowed||!Object.hasOwn(state.stations,mode))return false;const cost=stationCost(state.stations[mode]);if(state.coins<cost)return false;state.coins-=cost;state.stations[mode]++;return true;}
