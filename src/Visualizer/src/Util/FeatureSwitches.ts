
let featureSwitches = {
  SHOW_ADDRESS_BALANCE_CHART_DATA: false
};

export default class FeatureSwitchService {
  public static setFeatureSwitch(name: string, val: boolean) {
    featureSwitches[name] = val;
  }

  public static getFeatureSwitch(name: string): boolean {
    return !!featureSwitches[name];
  }
}
