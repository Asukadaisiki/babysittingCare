
const app = getApp();

Page({
  data: {
    childId: '',
    childInfo: {},
    // 直接初始化示例数据
    // 在页面的data中添加这个数据
    // WHO标准数据
    whoStandard: [
      { age: 0, value: 3.5 },
      { age: 1, value: 4.3 },
      { age: 2, value: 5.1 },
      { age: 3, value: 5.8 },
      { age: 4, value: 6.5 },
      { age: 5, value: 7.1 },
      { age: 6, value: 7.6 },
      { age: 7, value: 8.1 },
      { age: 8, value: 8.6 },
      { age: 9, value: 9.0 },
      { age: 10, value: 9.3 },
      { age: 11, value: 9.7 },
      { age: 12, value: 10.0 },
      { age: 18, value: 11.5 },
      { age: 24, value: 12.7 },
      { age: 30, value: 13.8 },
      { age: 36, value: 14.8 }
    ],
    boyWeightDataWho: [
      { age: 0, l: 0.3487, m: 3.3464, s: 0.14602, p3: 2.5, p15: 2.9, p50: 3.3, p85: 3.9, p97: 4.3, type: 'WHO标准' },
      { age: 1, l: 0.2297, m: 4.4709, s: 0.13395, p3: 3.4, p15: 3.9, p50: 4.5, p85: 5.1, p97: 5.7, type: 'WHO标准' },
      { age: 2, l: 0.197, m: 5.5675, s: 0.12385, p3: 4.4, p15: 4.9, p50: 5.6, p85: 6.3, p97: 7.0, type: 'WHO标准' },
      { age: 3, l: 0.1738, m: 6.3762, s: 0.11727, p3: 5.1, p15: 5.6, p50: 6.4, p85: 7.2, p97: 7.9, type: 'WHO标准' },
      { age: 4, l: 0.1553, m: 7.0023, s: 0.11316, p3: 5.6, p15: 6.2, p50: 7.0, p85: 7.9, p97: 8.6, type: 'WHO标准' },
      { age: 5, l: 0.1395, m: 7.5105, s: 0.1108, p3: 6.1, p15: 6.7, p50: 7.5, p85: 8.4, p97: 9.2, type: 'WHO标准' },
      { age: 6, l: 0.1257, m: 7.934, s: 0.10958, p3: 6.4, p15: 7.1, p50: 7.9, p85: 8.9, p97: 9.7, type: 'WHO标准' },
      { age: 7, l: 0.1134, m: 8.297, s: 0.10902, p3: 6.7, p15: 7.4, p50: 8.3, p85: 9.3, p97: 10.2, type: 'WHO标准' },
      { age: 8, l: 0.1021, m: 8.6151, s: 0.10882, p3: 7.0, p15: 7.7, p50: 8.6, p85: 9.6, p97: 10.5, type: 'WHO标准' },
      { age: 9, l: 0.0917, m: 8.9014, s: 0.10881, p3: 7.2, p15: 7.9, p50: 8.9, p85: 10.0, p97: 10.9, type: 'WHO标准' },
      { age: 10, l: 0.082, m: 9.1649, s: 0.10891, p3: 7.5, p15: 8.2, p50: 9.2, p85: 10.3, p97: 11.2, type: 'WHO标准' },
      { age: 11, l: 0.073, m: 9.4122, s: 0.10906, p3: 7.7, p15: 8.4, p50: 9.4, p85: 10.5, p97: 11.5, type: 'WHO标准' },
      { age: 12, l: 0.0644, m: 9.6479, s: 0.10925, p3: 7.8, p15: 8.6, p50: 9.6, p85: 10.8, p97: 11.8, type: 'WHO标准' },
      { age: 13, l: 0.0563, m: 9.8749, s: 0.10949, p3: 8.0, p15: 8.8, p50: 9.9, p85: 11.1, p97: 12.1, type: 'WHO标准' },
      { age: 14, l: 0.0487, m: 10.0953, s: 0.10976, p3: 8.2, p15: 9.0, p50: 10.1, p85: 11.3, p97: 12.4, type: 'WHO标准' },
      { age: 15, l: 0.0413, m: 10.3108, s: 0.11007, p3: 8.4, p15: 9.2, p50: 10.3, p85: 11.6, p97: 12.7, type: 'WHO标准' },
      { age: 16, l: 0.0343, m: 10.5228, s: 0.11041, p3: 8.5, p15: 9.4, p50: 10.5, p85: 11.8, p97: 12.9, type: 'WHO标准' },
      { age: 17, l: 0.0275, m: 10.7319, s: 0.11079, p3: 8.7, p15: 9.6, p50: 10.7, p85: 12.0, p97: 13.2, type: 'WHO标准' },
      { age: 18, l: 0.0211, m: 10.9385, s: 0.11119, p3: 8.9, p15: 9.7, p50: 10.9, p85: 12.3, p97: 13.5, type: 'WHO标准' },
      { age: 19, l: 0.0148, m: 11.143, s: 0.11164, p3: 9.0, p15: 9.9, p50: 11.1, p85: 12.5, p97: 13.7, type: 'WHO标准' },
      { age: 20, l: 0.0087, m: 11.3462, s: 0.11211, p3: 9.2, p15: 10.1, p50: 11.3, p85: 12.7, p97: 14.0, type: 'WHO标准' },
      { age: 21, l: 0.0029, m: 11.5486, s: 0.11261, p3: 9.3, p15: 10.3, p50: 11.5, p85: 13.0, p97: 14.3, type: 'WHO标准' },
      { age: 22, l: -0.0028, m: 11.7504, s: 0.11314, p3: 9.5, p15: 10.5, p50: 11.8, p85: 13.2, p97: 14.5, type: 'WHO标准' },
      { age: 23, l: -0.0083, m: 11.9514, s: 0.11369, p3: 9.7, p15: 10.6, p50: 12.0, p85: 13.4, p97: 14.8, type: 'WHO标准' },
      { age: 24, l: -0.0137, m: 12.1515, s: 0.11426, p3: 9.8, p15: 10.8, p50: 12.2, p85: 13.7, p97: 15.1, type: 'WHO标准' },
      { age: 25, l: -0.0189, m: 12.3502, s: 0.11485, p3: 10.0, p15: 11.0, p50: 12.4, p85: 13.9, p97: 15.3, type: 'WHO标准' },
      { age: 26, l: -0.024, m: 12.5466, s: 0.11544, p3: 10.1, p15: 11.1, p50: 12.5, p85: 14.1, p97: 15.6, type: 'WHO标准' },
      { age: 27, l: -0.0289, m: 12.7401, s: 0.11604, p3: 10.2, p15: 11.3, p50: 12.7, p85: 14.4, p97: 15.9, type: 'WHO标准' },
      { age: 28, l: -0.0337, m: 12.9303, s: 0.11664, p3: 10.4, p15: 11.5, p50: 12.9, p85: 14.6, p97: 16.1, type: 'WHO标准' },
      { age: 29, l: -0.0385, m: 13.1169, s: 0.11723, p3: 10.5, p15: 11.6, p50: 13.1, p85: 14.8, p97: 16.4, type: 'WHO标准' },
      { age: 30, l: -0.0431, m: 13.3, s: 0.11781, p3: 10.7, p15: 11.8, p50: 13.3, p85: 15.0, p97: 16.6, type: 'WHO标准' },
      { age: 31, l: -0.0476, m: 13.4798, s: 0.11839, p3: 10.8, p15: 11.9, p50: 13.5, p85: 15.2, p97: 16.9, type: 'WHO标准' },
      { age: 32, l: -0.052, m: 13.6567, s: 0.11896, p3: 10.9, p15: 12.1, p50: 13.7, p85: 15.5, p97: 17.1, type: 'WHO标准' },
      { age: 33, l: -0.0564, m: 13.8309, s: 0.11953, p3: 11.1, p15: 12.2, p50: 13.8, p85: 15.7, p97: 17.3, type: 'WHO标准' },
      { age: 34, l: -0.0606, m: 14.0031, s: 0.12008, p3: 11.2, p15: 12.4, p50: 14.0, p85: 15.9, p97: 17.6, type: 'WHO标准' },
      { age: 35, l: -0.0648, m: 14.1736, s: 0.12062, p3: 11.3, p15: 12.5, p50: 14.2, p85: 16.1, p97: 17.8, type: 'WHO标准' },
      { age: 36, l: -0.0689, m: 14.3429, s: 0.12116, p3: 11.4, p15: 12.7, p50: 14.3, p85: 16.3, p97: 18.0, type: 'WHO标准' },
      { age: 37, l: -0.0729, m: 14.5113, s: 0.12168, p3: 11.6, p15: 12.8, p50: 14.5, p85: 16.5, p97: 18.3, type: 'WHO标准' },
      { age: 38, l: -0.0769, m: 14.6791, s: 0.1222, p3: 11.7, p15: 12.9, p50: 14.7, p85: 16.7, p97: 18.5, type: 'WHO标准' },
      { age: 39, l: -0.0808, m: 14.8466, s: 0.12271, p3: 11.8, p15: 13.1, p50: 14.8, p85: 16.9, p97: 18.7, type: 'WHO标准' },
      { age: 40, l: -0.0846, m: 15.014, s: 0.12322, p3: 11.9, p15: 13.2, p50: 15.0, p85: 17.1, p97: 19.0, type: 'WHO标准' },
      { age: 41, l: -0.0883, m: 15.1813, s: 0.12373, p3: 12.1, p15: 13.4, p50: 15.2, p85: 17.3, p97: 19.2, type: 'WHO标准' },
      { age: 42, l: -0.092, m: 15.3486, s: 0.12425, p3: 12.2, p15: 13.5, p50: 15.3, p85: 17.5, p97: 19.4, type: 'WHO标准' },
      { age: 43, l: -0.0957, m: 15.5158, s: 0.12478, p3: 12.3, p15: 13.6, p50: 15.5, p85: 17.7, p97: 19.7, type: 'WHO标准' },
      { age: 44, l: -0.0993, m: 15.6828, s: 0.12531, p3: 12.4, p15: 13.8, p50: 15.7, p85: 17.9, p97: 19.9, type: 'WHO标准' },
      { age: 45, l: -0.1028, m: 15.8497, s: 0.12586, p3: 12.5, p15: 13.9, p50: 15.8, p85: 18.1, p97: 20.1, type: 'WHO标准' },
      { age: 46, l: -0.1063, m: 16.0163, s: 0.12643, p3: 12.7, p15: 14.1, p50: 16.0, p85: 18.3, p97: 20.4, type: 'WHO标准' },
      { age: 47, l: -0.1097, m: 16.1827, s: 0.127, p3: 12.8, p15: 14.2, p50: 16.2, p85: 18.5, p97: 20.6, type: 'WHO标准' },
      { age: 48, l: -0.1131, m: 16.3489, s: 0.12759, p3: 12.9, p15: 14.3, p50: 16.3, p85: 18.7, p97: 20.9, type: 'WHO标准' },
      { age: 49, l: -0.1165, m: 16.515, s: 0.12819, p3: 13.0, p15: 14.5, p50: 16.5, p85: 18.9, p97: 21.1, type: 'WHO标准' },
      { age: 50, l: -0.1198, m: 16.6811, s: 0.1288, p3: 13.1, p15: 14.6, p50: 16.7, p85: 19.1, p97: 21.3, type: 'WHO标准' },
      { age: 51, l: -0.123, m: 16.8471, s: 0.12943, p3: 13.3, p15: 14.7, p50: 16.8, p85: 19.3, p97: 21.6, type: 'WHO标准' },
      { age: 52, l: -0.1262, m: 17.0132, s: 0.13005, p3: 13.4, p15: 14.9, p50: 17.0, p85: 19.5, p97: 21.8, type: 'WHO标准' },
      { age: 53, l: -0.1294, m: 17.1792, s: 0.13069, p3: 13.5, p15: 15.0, p50: 17.2, p85: 19.7, p97: 22.1, type: 'WHO标准' },
      { age: 54, l: -0.1325, m: 17.3452, s: 0.13133, p3: 13.6, p15: 15.2, p50: 17.3, p85: 19.9, p97: 22.3, type: 'WHO标准' },
      { age: 55, l: -0.1356, m: 17.5111, s: 0.13197, p3: 13.7, p15: 15.3, p50: 17.5, p85: 20.1, p97: 22.5, type: 'WHO标准' },
      { age: 56, l: -0.1387, m: 17.6768, s: 0.13261, p3: 13.8, p15: 15.4, p50: 17.7, p85: 20.3, p97: 22.8, type: 'WHO标准' },
      { age: 57, l: -0.1417, m: 17.8422, s: 0.13325, p3: 13.9, p15: 15.6, p50: 17.8, p85: 20.5, p97: 23.0, type: 'WHO标准' },
      { age: 58, l: -0.1447, m: 18.0073, s: 0.13389, p3: 14.1, p15: 15.7, p50: 18.0, p85: 20.7, p97: 23.3, type: 'WHO标准' },
      { age: 59, l: -0.1477, m: 18.1722, s: 0.13453, p3: 14.2, p15: 15.8, p50: 18.2, p85: 20.9, p97: 23.5, type: 'WHO标准' },
      { age: 60, l: -0.1506, m: 18.3366, s: 0.13517, p3: 14.3, p15: 16.0, p50: 18.3, p85: 21.1, p97: 23.8, type: 'WHO标准' }
    ],
    girlWeightDataWho: [
      { "age": 0, "l": 0.3809, "m": 3.2322, "s": 0.14171, "p3": 2.4, "p15": 2.8, "p50": 3.2, "p85": 3.7, "p97": 4.2, "type": "WHO标准" },
      { "age": 1, "l": 0.1714, "m": 4.1873, "s": 0.13724, "p3": 3.2, "p15": 3.6, "p50": 4.2, "p85": 4.8, "p97": 5.4, "type": "WHO标准" },
      { "age": 2, "l": 0.0962, "m": 5.1282, "s": 0.13, "p3": 4.0, "p15": 4.5, "p50": 5.1, "p85": 5.9, "p97": 6.5, "type": "WHO标准" },
      { "age": 3, "l": 0.0402, "m": 5.8458, "s": 0.12619, "p3": 4.6, "p15": 5.1, "p50": 5.8, "p85": 6.7, "p97": 7.4, "type": "WHO标准" },
      { "age": 4, "l": -0.005, "m": 6.4237, "s": 0.12402, "p3": 5.1, "p15": 5.6, "p50": 6.4, "p85": 7.3, "p97": 8.1, "type": "WHO标准" },
      { "age": 5, "l": -0.043, "m": 6.8985, "s": 0.12274, "p3": 5.5, "p15": 6.1, "p50": 6.9, "p85": 7.8, "p97": 8.7, "type": "WHO标准" },
      { "age": 6, "l": -0.0756, "m": 7.297, "s": 0.12204, "p3": 5.8, "p15": 6.4, "p50": 7.3, "p85": 8.3, "p97": 9.2, "type": "WHO标准" },
      { "age": 7, "l": -0.1039, "m": 7.6422, "s": 0.12178, "p3": 6.1, "p15": 6.7, "p50": 7.6, "p85": 8.7, "p97": 9.6, "type": "WHO标准" },
      { "age": 8, "l": -0.1288, "m": 7.9487, "s": 0.12181, "p3": 6.3, "p15": 7.0, "p50": 7.9, "p85": 9.0, "p97": 10.0, "type": "WHO标准" },
      { "age": 9, "l": -0.1507, "m": 8.2254, "s": 0.12199, "p3": 6.6, "p15": 7.3, "p50": 8.2, "p85": 9.3, "p97": 10.4, "type": "WHO标准" },
      { "age": 10, "l": -0.17, "m": 8.48, "s": 0.12223, "p3": 6.8, "p15": 7.5, "p50": 8.5, "p85": 9.6, "p97": 10.7, "type": "WHO标准" },
      { "age": 11, "l": -0.1872, "m": 8.7192, "s": 0.12247, "p3": 7.0, "p15": 7.7, "p50": 8.7, "p85": 9.9, "p97": 11.0, "type": "WHO标准" },
      { "age": 12, "l": -0.2024, "m": 8.9481, "s": 0.12268, "p3": 7.1, "p15": 7.9, "p50": 8.9, "p85": 10.2, "p97": 11.3, "type": "WHO标准" },
      { "age": 13, "l": -0.2158, "m": 9.1699, "s": 0.12283, "p3": 7.3, "p15": 8.1, "p50": 9.2, "p85": 10.4, "p97": 11.6, "type": "WHO标准" },
      { "age": 14, "l": -0.2278, "m": 9.387, "s": 0.12294, "p3": 7.5, "p15": 8.3, "p50": 9.4, "p85": 10.7, "p97": 11.9, "type": "WHO标准" },
      { "age": 15, "l": -0.2384, "m": 9.6008, "s": 0.12299, "p3": 7.7, "p15": 8.5, "p50": 9.6, "p85": 10.9, "p97": 12.2, "type": "WHO标准" },
      { "age": 16, "l": -0.2478, "m": 9.8124, "s": 0.12303, "p3": 7.8, "p15": 8.7, "p50": 9.8, "p85": 11.2, "p97": 12.5, "type": "WHO标准" },
      { "age": 17, "l": -0.2562, "m": 10.0226, "s": 0.12306, "p3": 8.0, "p15": 8.8, "p50": 10.0, "p85": 11.4, "p97": 12.7, "type": "WHO标准" },
      { "age": 18, "l": -0.2637, "m": 10.2315, "s": 0.12309, "p3": 8.2, "p15": 9.0, "p50": 10.2, "p85": 11.6, "p97": 13.0, "type": "WHO标准" },
      { "age": 19, "l": -0.2703, "m": 10.4393, "s": 0.12315, "p3": 8.3, "p15": 9.2, "p50": 10.4, "p85": 11.9, "p97": 13.3, "type": "WHO标准" },
      { "age": 20, "l": -0.2762, "m": 10.6464, "s": 0.12323, "p3": 8.5, "p15": 9.4, "p50": 10.6, "p85": 12.1, "p97": 13.5, "type": "WHO标准" },
      { "age": 21, "l": -0.2815, "m": 10.8534, "s": 0.12335, "p3": 8.7, "p15": 9.6, "p50": 10.9, "p85": 12.3, "p97": 13.8, "type": "WHO标准" },
      { "age": 22, "l": -0.2862, "m": 11.0608, "s": 0.1235, "p3": 8.8, "p15": 9.8, "p50": 11.1, "p85": 12.5, "p97": 14.0, "type": "WHO标准" },
      { "age": 23, "l": -0.2903, "m": 11.2688, "s": 0.12369, "p3": 9.0, "p15": 9.9, "p50": 11.3, "p85": 12.8, "p97": 14.3, "type": "WHO标准" },
      { "age": 24, "l": -0.2941, "m": 11.4775, "s": 0.1239, "p3": 9.2, "p15": 10.1, "p50": 11.5, "p85": 13.0, "p97": 14.5, "type": "WHO标准" },
      { "age": 25, "l": -0.2975, "m": 11.6864, "s": 0.12414, "p3": 9.3, "p15": 10.3, "p50": 11.7, "p85": 13.2, "p97": 14.8, "type": "WHO标准" },
      { "age": 26, "l": -0.3005, "m": 11.8947, "s": 0.12441, "p3": 9.5, "p15": 10.5, "p50": 11.9, "p85": 13.4, "p97": 15.0, "type": "WHO标准" },
      { "age": 27, "l": -0.3032, "m": 12.1015, "s": 0.12472, "p3": 9.6, "p15": 10.7, "p50": 12.1, "p85": 13.7, "p97": 15.3, "type": "WHO标准" },
      { "age": 28, "l": -0.3057, "m": 12.3059, "s": 0.12506, "p3": 9.8, "p15": 10.9, "p50": 12.3, "p85": 13.9, "p97": 15.5, "type": "WHO标准" },
      { "age": 29, "l": -0.308, "m": 12.5073, "s": 0.12545, "p3": 10.0, "p15": 11.0, "p50": 12.5, "p85": 14.1, "p97": 15.8, "type": "WHO标准" },
      { "age": 30, "l": -0.3101, "m": 12.7055, "s": 0.12587, "p3": 10.1, "p15": 11.2, "p50": 12.7, "p85": 14.3, "p97": 16.0, "type": "WHO标准" },
      { "age": 31, "l": -0.312, "m": 12.9006, "s": 0.12633, "p3": 10.3, "p15": 11.3, "p50": 12.9, "p85": 14.6, "p97": 16.5, "type": "WHO标准" },
      { "age": 32, "l": -0.3138, "m": 13.093, "s": 0.12683, "p3": 10.4, "p15": 11.5, "p50": 13.1, "p85": 14.8, "p97": 16.8, "type": "WHO标准" },
      { "age": 33, "l": -0.3155, "m": 13.2837, "s": 0.12737, "p3": 10.5, "p15": 11.7, "p50": 13.3, "p85": 15.0, "p97": 17.0, "type": "WHO标准" },
      { "age": 34, "l": -0.3171, "m": 13.4731, "s": 0.12794, "p3": 10.7, "p15": 11.8, "p50": 13.5, "p85": 15.2, "p97": 17.3, "type": "WHO标准" },
      { "age": 35, "l": -0.3186, "m": 13.6618, "s": 0.12855, "p3": 10.8, "p15": 12.0, "p50": 13.7, "p85": 15.4, "p97": 17.6, "type": "WHO标准" },
      { "age": 36, "l": -0.3201, "m": 13.8503, "s": 0.12919, "p3": 10.9, "p15": 12.1, "p50": 13.9, "p85": 15.7, "p97": 17.8, "type": "WHO标准" },
      { "age": 37, "l": -0.3216, "m": 14.0385, "s": 0.12988, "p3": 11.0, "p15": 12.3, "p50": 14.0, "p85": 15.9, "p97": 18.1, "type": "WHO标准" },
      { "age": 38, "l": -0.323, "m": 14.2265, "s": 0.13059, "p3": 11.1, "p15": 12.4, "p50": 14.2, "p85": 16.1, "p97": 18.4, "type": "WHO标准" },
      { "age": 39, "l": -0.3243, "m": 14.414, "s": 0.13135, "p3": 11.3, "p15": 12.6, "p50": 14.4, "p85": 16.4, "p97": 18.7, "type": "WHO标准" },
      { "age": 40, "l": -0.3257, "m": 14.601, "s": 0.13213, "p3": 11.4, "p15": 12.7, "p50": 14.6, "p85": 16.6, "p97": 19.0, "type": "WHO标准" },
      { "age": 41, "l": -0.327, "m": 14.7873, "s": 0.13293, "p3": 11.5, "p15": 12.9, "p50": 14.8, "p85": 16.8, "p97": 19.3, "type": "WHO标准" },
      { "age": 42, "l": -0.3283, "m": 14.9727, "s": 0.13376, "p3": 11.6, "p15": 13.0, "p50": 15.0, "p85": 17.1, "p97": 19.5, "type": "WHO标准" },
      { "age": 43, "l": -0.3296, "m": 15.1573, "s": 0.1346, "p3": 11.7, "p15": 13.2, "p50": 15.2, "p85": 17.3, "p97": 19.8, "type": "WHO标准" },
      { "age": 44, "l": -0.3309, "m": 15.341, "s": 0.13545, "p3": 11.8, "p15": 13.3, "p50": 15.3, "p85": 17.5, "p97": 20.1, "type": "WHO标准" },
      { "age": 45, "l": -0.3322, "m": 15.524, "s": 0.1363, "p3": 11.9, "p15": 13.5, "p50": 15.5, "p85": 17.8, "p97": 20.4, "type": "WHO标准" },
      { "age": 46, "l": -0.3335, "m": 15.7064, "s": 0.13716, "p3": 12.0, "p15": 13.6, "p50": 15.7, "p85": 18.0, "p97": 20.6, "type": "WHO标准" },
      { "age": 47, "l": -0.3348, "m": 15.8882, "s": 0.138, "p3": 12.1, "p15": 13.8, "p50": 15.9, "p85": 18.2, "p97": 20.9, "type": "WHO标准" },
      { "age": 48, "l": -0.3361, "m": 16.0697, "s": 0.13884, "p3": 12.2, "p15": 13.9, "p50": 16.1, "p85": 18.5, "p97": 21.1, "type": "WHO标准" },
      { "age": 49, "l": -0.3374, "m": 16.2511, "s": 0.13968, "p3": 12.3, "p15": 14.0, "p50": 16.3, "p85": 18.7, "p97": 21.4, "type": "WHO标准" },
      { "age": 50, "l": -0.3387, "m": 16.4322, "s": 0.14051, "p3": 12.4, "p15": 14.2, "p50": 16.4, "p85": 18.9, "p97": 21.7, "type": "WHO标准" },
      { "age": 51, "l": -0.34, "m": 16.6133, "s": 0.14132, "p3": 12.5, "p15": 14.3, "p50": 16.6, "p85": 19.2, "p97": 22.0, "type": "WHO标准" },
      { "age": 52, "l": -0.3414, "m": 16.7942, "s": 0.14213, "p3": 12.6, "p15": 14.5, "p50": 16.8, "p85": 19.4, "p97": 22.2, "type": "WHO标准" },
      { "age": 53, "l": -0.3427, "m": 16.9748, "s": 0.14293, "p3": 12.7, "p15": 14.6, "p50": 17.0, "p85": 19.6, "p97": 22.5, "type": "WHO标准" },
      { "age": 54, "l": -0.344, "m": 17.1551, "s": 0.14371, "p3": 12.8, "p15": 14.7, "p50": 17.2, "p85": 19.9, "p97": 22.8, "type": "WHO标准" },
      { "age": 55, "l": -0.3453, "m": 17.3347, "s": 0.14448, "p3": 12.9, "p15": 14.9, "p50": 17.3, "p85": 20.1, "p97": 23.0, "type": "WHO标准" },
      { "age": 56, "l": -0.3466, "m": 17.5136, "s": 0.14525, "p3": 13.0, "p15": 15.0, "p50": 17.5, "p85": 20.3, "p97": 23.3, "type": "WHO标准" },
      { "age": 57, "l": -0.3479, "m": 17.6916, "s": 0.146, "p3": 13.1, "p15": 15.2, "p50": 17.7, "p85": 20.6, "p97": 23.6, "type": "WHO标准" },
      { "age": 58, "l": -0.3492, "m": 17.8686, "s": 0.14675, "p3": 13.2, "p15": 15.3, "p50": 17.9, "p85": 20.8, "p97": 23.9, "type": "WHO标准" },
      { "age": 59, "l": -0.3505, "m": 18.0445, "s": 0.14748, "p3": 13.3, "p15": 15.4, "p50": 18.0, "p85": 21.1, "p97": 24.2, "type": "WHO标准" },
      { "age": 60, "l": -0.3518, "m": 18.2193, "s": 0.14821, "p3": 13.4, "p15": 15.6, "p50": 18.2, "p85": 21.3, "p97": 24.4, "type": "WHO标准" }
    ],
    boyWeightDataFenton: [
      { age: 22, p3: 0.45, p10: 0.55, p50: 0.65, p90: 0.75, p97: 0.85, type: 'Fenton标准' },
      { age: 24, p3: 0.60, p10: 0.70, p50: 0.85, p90: 1.00, p97: 1.10, type: 'Fenton标准' },
      { age: 26, p3: 0.80, p10: 0.90, p50: 1.15, p90: 1.30, p97: 1.45, type: 'Fenton标准' },
      { age: 28, p3: 1.05, p10: 1.20, p50: 1.45, p90: 1.70, p97: 1.90, type: 'Fenton标准' },
      { age: 30, p3: 1.35, p10: 1.55, p50: 1.85, p90: 2.15, p97: 2.40, type: 'Fenton标准' },
      { age: 32, p3: 1.75, p10: 2.00, p50: 2.40, p90: 2.70, p97: 3.00, type: 'Fenton标准' },
      { age: 34, p3: 2.25, p10: 2.55, p50: 3.00, p90: 3.40, p97: 3.75, type: 'Fenton标准' },
      { age: 36, p3: 2.80, p10: 3.10, p50: 3.50, p90: 4.00, p97: 4.40, type: 'Fenton标准' },
      { age: 38, p3: 3.30, p10: 3.60, p50: 3.90, p90: 4.50, p97: 5.00, type: 'Fenton标准' },
      { age: 40, p3: 3.60, p10: 3.90, p50: 4.20, p90: 4.80, p97: 5.30, type: 'Fenton标准' }
    ],
    girlWeightDataFenton: [
      { age: 22, p3: 0.37, p10: 0.40, p50: 0.45, p90: 0.52, p97: 0.55, type: 'Fenton标准' },
      { age: 24, p3: 0.48, p10: 0.52, p50: 0.58, p90: 0.66, p97: 0.70, type: 'Fenton标准' },
      { age: 26, p3: 0.62, p10: 0.68, p50: 0.76, p90: 0.85, p97: 0.90, type: 'Fenton标准' },
      { age: 28, p3: 0.83, p10: 0.90, p50: 1.01, p90: 1.12, p97: 1.20, type: 'Fenton标准' },
      { age: 30, p3: 1.10, p10: 1.18, p50: 1.30, p90: 1.44, p97: 1.52, type: 'Fenton标准' },
      { age: 32, p3: 1.40, p10: 1.50, p50: 1.65, p90: 1.82, p97: 1.90, type: 'Fenton标准' },
      { age: 34, p3: 1.75, p10: 1.85, p50: 2.05, p90: 2.25, p97: 2.35, type: 'Fenton标准' },
      { age: 36, p3: 2.15, p10: 2.25, p50: 2.45, p90: 2.70, p97: 2.85, type: 'Fenton标准' },
      { age: 38, p3: 2.55, p10: 2.65, p50: 2.85, p90: 3.15, p97: 3.30, type: 'Fenton标准' },
      { age: 40, p3: 2.95, p10: 3.05, p50: 3.25, p90: 3.55, p97: 3.75, type: 'Fenton标准' }
    ],
    // 示例生长记录数据
    growthRecords: [
    ],

    // 示例孩子信息
    childInfo: {
    },

    showAddForm: false
  },

  onLoad: function (options) {
    console.log('头围图表页面加载中...');

    // 获取传递的参数
    const childId = options.childId || 'default';
    this.setData({ childId });

    // 获取宝宝信息
    const childInfo = wx.getStorageSync('childInfo') || [];
    let currentChild = {};

    if (childId !== 'default') {
      // 查找对应的宝宝信息
      for (let child of childInfo) {
        if (encodeURIComponent(child.name) === childId) {
          currentChild = child;
          break;
        }
      }
    } else if (childInfo.length > 0) {
      // 如果没有指定宝宝，使用第一个宝宝
      currentChild = childInfo[0];
    }

    // 设置今天的日期作为默认录入日期
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 获取生长记录
    let growthRecords = [];
    if (currentChild && currentChild.name) {
      const storageKey = `growthRecords_${currentChild.name}`;
      growthRecords = wx.getStorageSync(storageKey) || [];
    }

    this.setData({
      childInfo: currentChild,
      growthRecords: growthRecords,
      'newRecord.date': dateStr
    });
  },

  onReady: function () {
    // 添加延时确保页面已完全渲染
    setTimeout(() => {
      this.drawweightCircumferenceChart();
    }, 300);
  },

  // 切换添加记录表单的显示状态
  toggleAddForm: function () {
    this.setData({
      showAddForm: !this.data.showAddForm
    });
  },

  // 处理日期选择变化
  onDateChange: function (e) {
    this.setData({
      'newRecord.date': e.detail.value
    });
  },

  // 处理头围输入变化
  onweightInput: function (e) {
    this.setData({
      'newRecord.weight': e.detail.value
    });
  },

  // 使用canvas绘制简单图表
  drawweightCircumferenceChart: function () {
    const ctx = wx.createCanvasContext('weight-chart');
    const records = this.data.growthRecords;
    const standardData = this.data.whoStandard;
    // 设置图表边距和尺寸 
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const canvasWidth = 320;
    const canvasHeight = 300;
    const chartWidth = canvasWidth - margin.left - margin.right;
    const chartHeight = canvasHeight - margin.top - margin.bottom;

    // 找出所有记录的月龄范围 
    let minMonth = 0;
    let maxMonth = 36; // 根据需求设置最大值为36个月 

    // 如果有记录，则根据记录的月龄调整范围 
    if (records && records.length > 0) {
      // 修改：优先使用用户输入的月龄数据 
      records.forEach(record => {
        // 优先使用用户输入的月龄，如果没有则根据日期计算 
        let monthAge;
        if (record.ageInMonths !== null && record.ageInMonths !== undefined) {
          monthAge = parseFloat(record.ageInMonths);
        } else {
          const birthDate = new Date(this.data.childInfo.birthDate);
          const recordDate = new Date(record.date);
          monthAge = (recordDate.getFullYear() - birthDate.getFullYear()) * 12 +
            recordDate.getMonth() - birthDate.getMonth();
        }

        minMonth = Math.min(minMonth, monthAge);
        maxMonth = Math.max(maxMonth, monthAge);
      });
    }

    // 确保范围至少包含0-36个月，但不超过36个月 
    minMonth = Math.max(0, Math.min(minMonth, 0));
    maxMonth = Math.min(36, Math.max(12, maxMonth));

    // 设置X轴和Y轴的比例尺 
    const xScale = chartWidth / maxMonth;

    // 根据WHO数据设置体重范围 
    const yMin = 3.0; // 体重最小值 (kg)，略小于最小标准值 
    const yMax = 15.0; // 体重最大值 (kg)，略大于36月龄最大标准值 
    const yScale = chartHeight / (yMax - yMin);

    // 清空画布 
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 绘制坐标轴 
    ctx.beginPath();
    ctx.setLineWidth(1);
    ctx.setStrokeStyle('#333333');

    // X轴 
    ctx.moveTo(margin.left, canvasHeight - margin.bottom);
    ctx.lineTo(margin.left + chartWidth, canvasHeight - margin.bottom);

    // Y轴 
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, canvasHeight - margin.bottom);
    ctx.stroke();

    // 绘制X轴刻度和标签 
    ctx.setFontSize(10);
    ctx.setTextAlign('center');
    ctx.setTextBaseline('top');
    ctx.setFillStyle('#333333');

    // 绘制X轴网格线和刻度 - 1年内每月显示，1年后每6个月显示一次 
    for (let month = 0; month <= maxMonth; month++) {
      // 确定是否显示此月龄的刻度 
      // 0-12个月每个月显示，12个月后每6个月显示一次 
      const showTick = month <= 12 || month % 6 === 0;

      if (showTick) {
        const x = margin.left + month * xScale;

        // 网格线 
        ctx.beginPath();
        ctx.setLineWidth(0.5);
        ctx.setStrokeStyle('#eeeeee');
        ctx.moveTo(x, margin.top);
        ctx.lineTo(x, canvasHeight - margin.bottom);
        ctx.stroke();

        // 刻度线 
        ctx.beginPath();
        ctx.setLineWidth(1);
        ctx.setStrokeStyle('#333333');
        ctx.moveTo(x, canvasHeight - margin.bottom);
        ctx.lineTo(x, canvasHeight - margin.bottom + 5);
        ctx.stroke();

        // 标签 - 只在最后一个刻度显示"月"字
        if (month === maxMonth) {
          ctx.fillText(`${month}月`, x, canvasHeight - margin.bottom + 8);
        } else {
          ctx.fillText(`${month}`, x, canvasHeight - margin.bottom + 8);
        }
      }
    }

    // 绘制Y轴刻度和标签 
    ctx.setTextAlign('right');
    ctx.setTextBaseline('middle');

    // 绘制Y轴网格线和刻度 - 修改为体重单位kg，并调整刻度间隔 
    for (let kg = yMin; kg <= yMax; kg += 1) {
      const y = canvasHeight - margin.bottom - (kg - yMin) * yScale;

      // 网格线 
      ctx.beginPath();
      ctx.setLineWidth(0.5);
      ctx.setStrokeStyle('#eeeeee');
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();

      // 刻度线 
      ctx.beginPath();
      ctx.setLineWidth(1);
      ctx.setStrokeStyle('#333333');
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left - 5, y);
      ctx.stroke();

      // 标签 
      ctx.fillText(`${kg}kg`, margin.left - 8, y);
    }

    // 绘制X轴和Y轴标题 
    ctx.setFontSize(12);
    ctx.setTextAlign('center');
    ctx.fillText('月龄(月)', canvasWidth / 2, canvasHeight - 10);

    ctx.save();
    ctx.translate(15, canvasHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('体重(kg)', 0, 0);
    ctx.restore();

    // 绘制WHO标准曲线 
    ctx.beginPath();
    ctx.setStrokeStyle('#4caf50');
    ctx.setLineWidth(2);

    standardData.forEach((point, index) => {
      const x = margin.left + point.age * xScale;
      const y = canvasHeight - margin.bottom - (point.value - yMin) * yScale;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // 绘制宝宝的实际体重数据点 
    if (records && records.length > 0) {
      // 先绘制连接线 
      ctx.beginPath();
      ctx.setStrokeStyle('#e91e63');
      ctx.setLineWidth(1.5);

      // 按月龄排序记录 
      const sortedRecords = [...records].filter(record => record.weight)
        .map(record => {
          let monthAge;
          if (record.ageInMonths !== null && record.ageInMonths !== undefined) {
            monthAge = parseFloat(record.ageInMonths);
          } else {
            const birthDate = new Date(this.data.childInfo.birthDate);
            const recordDate = new Date(record.date);
            monthAge = (recordDate.getFullYear() - birthDate.getFullYear()) * 12 +
              recordDate.getMonth() - birthDate.getMonth();
          }
          return {
            ...record,
            monthAge
          };
        })
        .sort((a, b) => a.monthAge - b.monthAge);

      // 绘制连接线 
      sortedRecords.forEach((record, index) => {
        const x = margin.left + record.monthAge * xScale;
        const y = canvasHeight - margin.bottom - (record.weight - yMin) * yScale;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // 再绘制数据点和标签 
      ctx.setFillStyle('#e91e63');

      sortedRecords.forEach(record => {
        const x = margin.left + record.monthAge * xScale;
        const y = canvasHeight - margin.bottom - (record.weight - yMin) * yScale;

        // 绘制数据点 
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();

        // 在数据点旁显示具体体重值
        ctx.setFontSize(9);
        ctx.setTextAlign('left');
        ctx.fillText(`${record.weight}kg`, x + 5, y - 5);
      });
    }

    // 添加图例
    const legendX = margin.left + 10;
    let legendY = margin.top + 15;
    const legendSpacing = 20;

    // 中位数图例
    ctx.beginPath();
    ctx.setStrokeStyle('#4caf50');
    ctx.setLineWidth(2);
    ctx.moveTo(legendX, legendY);
    ctx.lineTo(legendX + 20, legendY);
    ctx.stroke();
    ctx.setFontSize(10);
    ctx.setTextAlign('left');
    ctx.setFillStyle('#333333');
    ctx.fillText('WHO标准', legendX + 25, legendY);

    // 宝宝数据图例
    legendY += legendSpacing;
    ctx.setFillStyle('#e91e63');
    ctx.beginPath();
    ctx.arc(legendX + 10, legendY, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.setFillStyle('#333333');
    ctx.fillText('宝宝体重', legendX + 25, legendY);

    ctx.draw();
  },
  //绘制头围曲线图
  //  drawweightCircumferenceChart: function () {
  //     const ctx = wx.createCanvasContext('weight-chart');
  //     const records = this.data.growthRecords;

  //     // 使用 whoStandard 数据
  //     const standardData = this.data.whoStandard;

  //     // 设置图表边距和尺寸
  //     const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  //     const canvasWidth = 320;
  //     const canvasHeight = 300;
  //     const chartWidth = canvasWidth - margin.left - margin.right;
  //     const chartHeight = canvasHeight - margin.top - margin.bottom;

  //     // 找出所有记录的月龄范围
  //     let minMonth = 0;
  //     let maxMonth = 12; // 根据 whoStandard 数据调整为 12 个月

  //     // 如果有记录，则根据记录的月龄调整范围
  //     if (records.length > 0) {
  //       // 修改：优先使用用户输入的月龄数据
  //       records.forEach(record => {
  //         // 优先使用用户输入的月龄，如果没有则根据日期计算
  //         let monthAge;
  //         if (record.ageInMonths !== null && record.ageInMonths !== undefined) {
  //           monthAge = parseFloat(record.ageInMonths);
  //         } else {
  //           const birthDate = new Date(this.data.childInfo.birthDate);
  //           const recordDate = new Date(record.date);
  //           monthAge = (recordDate.getFullYear() - birthDate.getFullYear()) * 12 +
  //             recordDate.getMonth() - birthDate.getMonth();
  //         }

  //         minMonth = Math.min(minMonth, monthAge);
  //         maxMonth = Math.max(maxMonth, monthAge);
  //       });
  //     }

  //     // 确保范围至少包含0-12个月
  //     minMonth = Math.max(0, Math.min(minMonth, 0));
  //     maxMonth = Math.max(12, maxMonth);

  //     // 设置X轴和Y轴的比例尺
  //     const xScale = chartWidth / maxMonth;
  //     const yMin = 3.3; // 体重最小值 (cm)
  //     const yMax = 10.0; // 体重最大值 (cm)
  //     const yScale = chartHeight / (yMax - yMin);

  //     // 清空画布
  //     ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  //     ctx.setFillStyle('#ffffff');
  //     ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  //     // 绘制坐标轴
  //     ctx.beginPath();
  //     ctx.setLineWidth(1);
  //     ctx.setStrokeStyle('#333333');

  //     // X轴
  //     ctx.moveTo(margin.left, canvasHeight - margin.bottom);
  //     ctx.lineTo(margin.left + chartWidth, canvasHeight - margin.bottom);

  //     // Y轴
  //     ctx.moveTo(margin.left, margin.top);
  //     ctx.lineTo(margin.left, canvasHeight - margin.bottom);
  //     ctx.stroke();

  //     // 绘制X轴刻度和标签
  //     ctx.setFontSize(10);
  //     ctx.setTextAlign('center');
  //     ctx.setTextBaseline('top');
  //     ctx.setFillStyle('#333333');

  //     // 绘制X轴网格线和刻度
  //     for (let month = 0; month <= maxMonth; month += 3) {
  //       const x = margin.left + month * xScale;

  //       // 网格线
  //       ctx.beginPath();
  //       ctx.setLineWidth(0.5);
  //       ctx.setStrokeStyle('#eeeeee');
  //       ctx.moveTo(x, margin.top);
  //       ctx.lineTo(x, canvasHeight - margin.bottom);
  //       ctx.stroke();

  //       // 刻度线
  //       ctx.beginPath();
  //       ctx.setLineWidth(1);
  //       ctx.setStrokeStyle('#333333');
  //       ctx.moveTo(x, canvasHeight - margin.bottom);
  //       ctx.lineTo(x, canvasHeight - margin.bottom + 5);
  //       ctx.stroke();

  //       // 标签
  //       ctx.fillText(`${month}月`, x, canvasHeight - margin.bottom + 8);
  //     }

  //     // 绘制Y轴刻度和标签
  //     ctx.setTextAlign('right');
  //     ctx.setTextBaseline('middle');

  //     // 绘制Y轴网格线和刻度
  //     for (let cm = yMin; cm <= yMax; cm += 5) {
  //       const y = canvasHeight - margin.bottom - (cm - yMin) * yScale;

  //       // 网格线
  //       ctx.beginPath();
  //       ctx.setLineWidth(0.5);
  //       ctx.setStrokeStyle('#eeeeee');
  //       ctx.moveTo(margin.left, y);
  //       ctx.lineTo(margin.left + chartWidth, y);
  //       ctx.stroke();

  //       // 刻度线
  //       ctx.beginPath();
  //       ctx.setLineWidth(1);
  //       ctx.setStrokeStyle('#333333');
  //       ctx.moveTo(margin.left, y);
  //       ctx.lineTo(margin.left - 5, y);
  //       ctx.stroke();

  //       // 标签
  //       ctx.fillText(`${cm}cm`, margin.left - 8, y);
  //     }

  //     // 绘制X轴和Y轴标题
  //     ctx.setFontSize(12);
  //     ctx.setTextAlign('center');
  //     ctx.fillText('月龄(月)', canvasWidth / 2, canvasHeight - 10);

  //     ctx.save();
  //     ctx.translate(15, canvasHeight / 2);
  //     ctx.rotate(-Math.PI / 2);
  //     ctx.fillText('体重(kg)', 0, 0);
  //     ctx.restore();

  //     // 绘制WHO标准曲线
  //     ctx.beginPath();
  //     ctx.setStrokeStyle('#4caf50');
  //     ctx.setLineWidth(2);

  //     standardData.forEach((point, index) => {
  //       const x = margin.left + point.age * xScale;
  //       const y = canvasHeight - margin.bottom - (point.value - yMin) * yScale;

  //       if (index === 0) {
  //         ctx.moveTo(x, y);
  //       } else {
  //         ctx.lineTo(x, y);
  //       }
  //     });

  //     ctx.stroke();

  //     // 绘制宝宝的实际头围数据点
  //     if (records.length > 0) {
  //       // 先绘制连接线
  //       ctx.beginPath();
  //       ctx.setStrokeStyle('#e91e63');
  //       ctx.setLineWidth(1.5);

  //       // 按月龄排序记录
  //       const sortedRecords = [...records].filter(record => record.weight)
  //         .map(record => {
  //           let monthAge;
  //           if (record.ageInMonths !== null && record.ageInMonths !== undefined) {
  //             monthAge = parseFloat(record.ageInMonths);
  //           } else {
  //             const birthDate = new Date(this.data.childInfo.birthDate);
  //             const recordDate = new Date(record.date);
  //             monthAge = (recordDate.getFullYear() - birthDate.getFullYear()) * 12 +
  //               recordDate.getMonth() - birthDate.getMonth();
  //           }
  //           return {
  //             ...record,
  //             monthAge
  //           };
  //         })
  //         .sort((a, b) => a.monthAge - b.monthAge);

  //       // 绘制连接线
  //       sortedRecords.forEach((record, index) => {
  //         const x = margin.left + record.monthAge * xScale;
  //         const y = canvasHeight - margin.bottom - (record.weight - yMin) * yScale;

  //         if (index === 0) {
  //           ctx.moveTo(x, y);
  //         } else {
  //           ctx.lineTo(x, y);
  //         }
  //       });

  //       ctx.stroke();

  //       // 再绘制数据点和标签
  //       ctx.setFillStyle('#e91e63');

  //       sortedRecords.forEach(record => {
  //         const x = margin.left + record.monthAge * xScale;
  //         const y = canvasHeight - margin.bottom - (record.weight - yMin) * yScale;

  //         // 绘制数据点
  //         ctx.beginPath();
  //         ctx.arc(x, y, 4, 0, 2 * Math.PI);
  //         ctx.fill();

  //         // 显示数值
  //         ctx.setTextAlign('center');
  //         ctx.setTextBaseline('bottom');
  //         ctx.fillText(record.weight.toString(), x, y - 8);
  //       });
  //     }

  //     // 绘制图例
  //     const legendX = margin.left + 10;
  //     let legendY = margin.top + 10;
  //     const legendSpacing = 20;

  //     // WHO标准曲线图例
  //     ctx.beginPath();
  //     ctx.setStrokeStyle('#4caf50');
  //     ctx.setLineWidth(2);
  //     ctx.moveTo(legendX, legendY);
  //     ctx.lineTo(legendX + 20, legendY);
  //     ctx.stroke();
  //     ctx.setTextAlign('left');
  //     ctx.setTextBaseline('middle');
  //     ctx.fillText('WHO标准', legendX + 25, legendY);

  //     // 宝宝数据图例
  //     legendY += legendSpacing;
  //     ctx.beginPath();
  //     ctx.setFillStyle('#e91e63');
  //     ctx.arc(legendX + 10, legendY, 4, 0, 2 * Math.PI);
  //     ctx.fill();
  //     ctx.fillText('宝宝体重', legendX + 25, legendY);

  //     // 绘制到画布
  //     ctx.draw();
  //   },

  // 返回上一页
  navigateBack: function () {
    wx.navigateBack();
  }
});