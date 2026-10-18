export const CHIP_FUNCTIONS=Object.freeze([
 {id:'moves',title:'着法生成',input:'当前局面与走棋方',action:'枚举候选着法，为下一层搜索提供分支。',output:'候选着法流',source:'S2 · IEEE Micro 1999，功能方框图；S1 §3.1–3.3',example:'局面 → 候选 A、B、C（抽象示意，未运行合法着法引擎）'},
 {id:'evaluate',title:'局面评估',input:'待比较的局面',action:'依据棋类知识特征计算评分，供搜索比较。',output:'局面评分',source:'S2 · 快慢评估；S1 §3.1–3.3',example:'教学局面 → 特征汇总 → 示例分数 +5（非历史实测）'},
 {id:'control',title:'搜索控制',input:'候选着法、评分与搜索界限',action:'协调硬件搜索的展开、回传与截断。',output:'分支选择与回传值',source:'S1 §3.3–3.4；S2 · 搜索控制',example:'α=5、β=2 → 当前分支截断（抽象界限示意）'},
 {id:'stack',title:'走法栈与重复检测',input:'当前搜索路径与走法记录',action:'维护搜索路径，并辅助识别重复局面。',output:'路径记录与重复标志',source:'S1 §3.1–3.3；S2 · 功能方框图',example:'局面 A → B → A → 重复标志（不是置换表）'}
]);
export function selectChipFunction(id){return CHIP_FUNCTIONS.find(f=>f.id===id)||null;}
