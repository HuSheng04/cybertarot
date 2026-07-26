/* ===== CyberTarot 78 张塔罗牌全量数据 ===== */
/* 22 张大阿卡纳 + 56 张小阿卡纳（权杖/圣杯/宝剑/星币各 14 张） */
/* 每张牌包含 element（元素）/ number（编号）/ imagery（牌面视觉描述） */

import type { Card } from "@/types"
import { Suit } from "@/types"

/* ------------------------------------------------------------------ */
/*  辅助：注入 imagePath                                              */
/* ------------------------------------------------------------------ */
function buildCards(raw: Omit<Card, "imagePath">[]): Card[] {
  return raw.map((c) => ({ ...c, imagePath: `/assets/cards/${c.id}.webp` }))
}

/* ------------------------------------------------------------------ */
/*  大阿卡纳 (Major Arcana) — 22 张                                   */
/* ------------------------------------------------------------------ */
const MAJOR: Card[] = buildCards([
  {
    id: "major_00",
    nameZh: "愚人",
    nameEn: "The Fool",
    suit: Suit.Major,
    keywords: ["新生", "冒险", "天真", "无限可能"],
    meaningUp: "新的开始、冒险的召唤，怀抱信念踏上未知旅程。放下过去的包袱，以开放心态迎接命运的礼物。",
    meaningDown: "鲁莽行事、冒险的代价，过度天真可能导致危险。需要停下来审视脚下的悬崖。",
    element: "风",
    number: 0,
    imagery:
      "一位年轻人站在悬崖边缘，肩扛行囊，脚边的小狗在欢跳，朝阳在身后升起，他正迈出未知的一步。",
  },
  {
    id: "major_01",
    nameZh: "魔术师",
    nameEn: "The Magician",
    suit: Suit.Major,
    keywords: ["创造", "专注", "技能", "资源整合"],
    meaningUp: "你拥有实现目标的一切工具。专注力与意志力将引导你创造新的现实，宇宙能量正在为你服务。",
    meaningDown: "才能被浪费、手段不正当，或过于自负。检查是否在滥用天赋，能量需要重新引导。",
    element: "风",
    number: 1,
    imagery:
      "他站在摆有权杖、圣杯、宝剑、星币四元素的桌前，一手指天一手指地，头顶悬浮无限符号∞，红袍白衫散发出自信的掌控力。",
  },
  {
    id: "major_02",
    nameZh: "女祭司",
    nameEn: "The High Priestess",
    suit: Suit.Major,
    keywords: ["直觉", "潜意识", "内在智慧", "神秘"],
    meaningUp: "倾听内心的声音，答案存在于你的潜意识中。这是一段需要静默与内省的时刻，智慧在宁静中浮现。",
    meaningDown: "忽视直觉、压抑感受，或深藏的秘密即将浮出水面。表面的平静下暗流涌动。",
    element: "水",
    number: 2,
    imagery:
      "她端坐于黑白两根柱子之间，身后是绘有石榴的帷幕，帷幕后隐约可见一片水域映着月光，膝上半掩着一卷律法书，脚边一弯新月。",
  },
  {
    id: "major_03",
    nameZh: "女皇",
    nameEn: "The Empress",
    suit: Suit.Major,
    keywords: ["丰收", "母性", "富饶", "自然之美"],
    meaningUp: "丰盛与成长的象征。创造力正在孕育新的结果，享受生活的丰饶，与自然和自己的身体和解。",
    meaningDown: "创造力受阻、依赖他人，或对物质的过度迷恋。需要找回内在的独立性与自我滋养的能力。",
    element: "土",
    number: 3,
    imagery:
      "她安坐于金色麦田与翠绿森林之间，头戴十二星辰的冠冕，手持权杖，身披绣满石榴的长袍，脚下是一颗心形盾牌缀着金星符号。",
  },
  {
    id: "major_04",
    nameZh: "皇帝",
    nameEn: "The Emperor",
    suit: Suit.Major,
    keywords: ["权力", "秩序", "权威", "掌控"],
    meaningUp: "建立结构与规则的时刻。通过纪律与自律获得掌控力，坚定的领导力保障了长期稳定。",
    meaningDown: "独裁、僵硬或滥用权力。过于强势的掌控会导致他人反抗，需要学会放下控制、适当放权。",
    element: "火",
    number: 4,
    imagery:
      "他端坐在石制王座上，身披铠甲与红袍，手握权杖与金球，背后是赤红山脉与橙色天空，四只公羊头装饰着宝座扶手。",
  },
  {
    id: "major_05",
    nameZh: "教皇",
    nameEn: "The Hierophant",
    suit: Suit.Major,
    keywords: ["传统", "信仰", "导师", "传承"],
    meaningUp: "寻求精神上的指引或正统的知识传授。传统与制度提供了稳定的框架，跟随既定的路径前行。",
    meaningDown: "教条主义、过度保守，或对权威的盲从。需要打破常规，找到自己的信仰而非全盘接受。",
    element: "土",
    number: 5,
    imagery:
      "他头戴三重冠冕坐在教堂中央的宝座上，左手持三重十字架，右手做出祝福手势，两位剃度僧侣跪在他面前，穿着绣有十字的白色外衣。",
  },
  {
    id: "major_06",
    nameZh: "恋人",
    nameEn: "The Lovers",
    suit: Suit.Major,
    keywords: ["选择", "结合", "关系", "价值观"],
    meaningUp: "重要的选择时刻，跟随内心的真实价值而非外在压力。深厚的联结正在形成，爱是核心动力。",
    meaningDown: "关系失衡、价值观冲突，或逃避承诺。需要诚实地面对自己与关系中真正的问题。",
    element: "风",
    number: 6,
    imagery:
      "天使拉斐尔张开巨大的红色双翼俯视大地，亚当与夏娃分别立于生命之树和善恶之树前，远处的火山山峦衬着金色的天空。",
  },
  {
    id: "major_07",
    nameZh: "战车",
    nameEn: "The Chariot",
    suit: Suit.Major,
    keywords: ["胜利", "意志力", "征服", "自信"],
    meaningUp: "通过强大的意志力克服障碍，势如破竹地前进。你的决心正在引领你走向胜利。",
    meaningDown: "方向迷失、攻击性过强，或缺乏自律。蛮力无法取代策略，需要重新掌控内心的对立力量。",
    element: "水",
    number: 7,
    imagery:
      "驾驭者站在由一黑一白两只斯芬克斯拉动的战车上，头戴八芒星辰冠冕，肩佩月牙护甲，身后的城堡隐没在远方的河流之中。",
  },
  {
    id: "major_08",
    nameZh: "力量",
    nameEn: "Strength",
    suit: Suit.Major,
    keywords: ["勇气", "内在力量", "耐心", "温柔掌控"],
    meaningUp: "真正的力量来自内在的坚韧与温和。用耐心和同理心驯服野兽，而非暴力压制。",
    meaningDown: "自我怀疑、意志薄弱，或对内在兽性的恐惧。需要重新连接内心深处的勇气。",
    element: "火",
    number: 8,
    imagery:
      "一位白衣女子温柔地合上雄狮的嘴，头顶有无限符号∞悬浮于她的金发之上，身后是远山与蓝天，白色玫瑰花环系于腰间。",
  },
  {
    id: "major_09",
    nameZh: "隐士",
    nameEn: "The Hermit",
    suit: Suit.Major,
    keywords: ["内省", "独处", "智慧", "指引"],
    meaningUp: "独自寻找内在之光。暂时的退隐是必要的，孤独中蕴藏着深刻的洞见与精神启蒙。",
    meaningDown: "过度孤立、逃避社交，或固执己见。需要平衡独处与社群的联系，不要永远处于孤独中。",
    element: "土",
    number: 9,
    imagery:
      "一位老者站在白雪皑皚的山峰之巅，一手拄着长杖，一手提着一盏六角星灯，灯中散发出金色的光芒，独自照亮黑暗的深渊。",
  },
  {
    id: "major_10",
    nameZh: "命运之轮",
    nameEn: "Wheel of Fortune",
    suit: Suit.Major,
    keywords: ["命运", "转折点", "循环", "机遇"],
    meaningUp: "命运之轮正在转动，新的机遇即将到来。一切都是周期的一部分，顺应当下的变化。",
    meaningDown: "厄运或失控的变化。抗拒循环只会带来痛苦，记住轮子总会再次上升。",
    element: "火",
    number: 10,
    imagery:
      "巨大的命运之轮在云中旋转，轮盘上方坐着持剑的斯芬克斯，四角有鹰、人、牛、狮四生灵在翻动书页，轮盘上刻着TARO四个字母。",
  },
  {
    id: "major_11",
    nameZh: "正义",
    nameEn: "Justice",
    suit: Suit.Major,
    keywords: ["公正", "真理", "平衡", "因果报应"],
    meaningUp: "因果关系正在显现，公平与真相终会得到伸张。理性的判断和诚实的评估会带来应得的结果。",
    meaningDown: "不公正、偏见或逃避责任。法律或道德的天平需要重新校准，检查自己是否在自欺欺人。",
    element: "风",
    number: 11,
    imagery:
      "她端坐于两根石柱之间，身穿红袍、披着绿披风，一手持天秤，一手持剑，目光直视前方，脚边放着方形金质鞋扣。",
  },
  {
    id: "major_12",
    nameZh: "倒吊人",
    nameEn: "The Hanged Man",
    suit: Suit.Major,
    keywords: ["牺牲", "暂停", "新视角", "顺其自然"],
    meaningUp: "主动的暂停与牺牲。从不同的角度看世界，放下控制，顺其自然反而会带来突破。",
    meaningDown: "无意义的牺牲、拖延或抗拒必要的停滞。需要诚实地反思：你的等待是智慧还是逃避？",
    element: "水",
    number: 12,
    imagery:
      "他被倒吊在T形木架上，一条腿弯曲成三角形，双手背在身后形成倒三角，头上有金色光环散发光芒，表情平和而超然。",
  },
  {
    id: "major_13",
    nameZh: "死神",
    nameEn: "Death",
    suit: Suit.Major,
    keywords: ["终结", "转变", "重生", "放下"],
    meaningUp: "旧阶段的终结为新生命腾出空间。彻底的转变是不可避免的，放下那些不再服务于你的事物。",
    meaningDown: "抗拒改变、卡在过渡期，或恐惧未知。拒绝结束只会延长痛苦，拥抱转变才能迎来新生。",
    element: "水",
    number: 13,
    imagery:
      "黑色铠甲的骑士骑着白马踩过国王、主教与孩童，远处有双子塔之间升起朝阳，旗杆上绽放着一朵白色玫瑰花——死亡的旗帜上开着新生的花。",
  },
  {
    id: "major_14",
    nameZh: "节制",
    nameEn: "Temperance",
    suit: Suit.Major,
    keywords: ["平衡", "调和", "耐心", "中庸之道"],
    meaningUp: "找到平衡点，调和对立的力量。耐心与持续的努力会带来和谐的结果，中庸之道是最佳路径。",
    meaningDown: "失衡、过激或缺乏耐心。生活失去了比例感，需要找回内在的节律与平衡。",
    element: "火",
    number: 14,
    imagery:
      "天使身穿白衣缓缓站立，将液体从一只金杯倒入另一只金杯，一脚踏在水中，一脚踏在岸上，胸前有一个三角图案，身后有一条蜿蜒向上的金色小径通向远方的皇冠。",
  },
  {
    id: "major_15",
    nameZh: "恶魔",
    nameEn: "The Devil",
    suit: Suit.Major,
    keywords: ["束缚", "物质主义", "执念", "阴影"],
    meaningUp: "被物质欲望或执念所束缚。诚实地审视那些你明知有害却无法脱离的习惯或关系。",
    meaningDown: "挣脱束缚、觉醒的时刻。黑暗中的锁链正在松动，你有能力切断那些不再健康的联结。",
    element: "土",
    number: 15,
    imagery:
      "半人半羊的恶魔站在石台上，展开巨大的蝙蝠翅膀，倒五芒星在额头闪耀，一男一女被松散的锁链拴在石柱上——锁链其实可以随时挣脱。",
  },
  {
    id: "major_16",
    nameZh: "高塔",
    nameEn: "The Tower",
    suit: Suit.Major,
    keywords: ["剧变", "崩塌", "启示", "重建"],
    meaningUp: "旧有结构突然崩塌，看似毁灭性的打击实则带来了真相与解放。震碎虚假的根基才能建立更真实的自我。",
    meaningDown: "避免灾难、延迟了必然的崩塌。抵抗改变只会让最终的坠落更加剧烈。",
    element: "火",
    number: 16,
    imagery:
      "一道闪电击中了高塔顶端的金色皇冠，火焰从窗口喷涌而出，两个人从塔上坠落，周围飞溅着二十二团火焰——那是被震碎的旧有结构。",
  },
  {
    id: "major_17",
    nameZh: "星星",
    nameEn: "The Star",
    suit: Suit.Major,
    keywords: ["希望", "灵感", "平静", "治愈"],
    meaningUp: "风暴过后的宁静与希望。星光指引着方向，深层的治愈正在发生，相信宇宙的善意安排。",
    meaningDown: "绝望、失去方向或灵感枯竭。需要重新找到信任，即使光亮微弱，也不要放弃希望的种子。",
    element: "风",
    number: 17,
    imagery:
      "一位裸体女子跪在水边，右脚踏入池塘，手持两壶分别向大地和湖面倾倒生命之水，天上有八颗星星，最大那颗光芒四射。远处树梢上停着一只鸟。",
  },
  {
    id: "major_18",
    nameZh: "月亮",
    nameEn: "The Moon",
    suit: Suit.Major,
    keywords: ["幻象", "恐惧", "潜意识", "未知"],
    meaningUp: "真相被阴影遮蔽，恐惧与幻觉令人不安。相信直觉穿越黑暗，但不要轻信表面看到的一切。",
    meaningDown: "逐渐看清真相，释放潜藏的恐惧。从幻觉中醒来的过程虽令人不安，却是必经之路。",
    element: "水",
    number: 18,
    imagery:
      "一弯新月在夜空中发出苍白的光，两只狗对月长吠，一只龙虾从幽暗的水中爬出，一条蜿蜒的小路通向远方两座塔柱之间的未知。",
  },
  {
    id: "major_19",
    nameZh: "太阳",
    nameEn: "The Sun",
    suit: Suit.Major,
    keywords: ["喜悦", "成功", "活力", "光明"],
    meaningUp: "充满喜悦与成功的光明时刻。一切都在阳光下清晰可见，温暖的能量带来了生命力与成就感。",
    meaningDown: "暂时的阴霾、乐观受阻。记住太阳始终存在，只是被云层暂时遮蔽，光明终会重返。",
    element: "火",
    number: 19,
    imagery:
      "一个孩子骑着白马在向日葵花园中前行，头上戴着一根红羽，手中举着一面鲜红的旗帜，巨大的太阳在天空中普照万物，阳光温暖而灿烂。",
  },
  {
    id: "major_20",
    nameZh: "审判",
    nameEn: "Judgement",
    suit: Suit.Major,
    keywords: ["觉醒", "重生", "召唤", "自我评估"],
    meaningUp: "被更高的力量召唤，迎来觉醒与重生的时刻。为自己过去的所作所为负责，以全新视角出发。",
    meaningDown: "自我怀疑、拒绝内在的召唤，或严苛的自我批评。放下对过去的执念，听从内心的号角。",
    element: "火",
    number: 20,
    imagery:
      "大天使加百列在天上吹响金色的号角，号角上挂着白底红十字旗，地上的人们从灰色石棺中伸出双手回应召唤，远处的雪山轮廓清晰可见。",
  },
  {
    id: "major_21",
    nameZh: "世界",
    nameEn: "The World",
    suit: Suit.Major,
    keywords: ["完成", "圆满", "整合", "旅程终章"],
    meaningUp: "一个周期的圆满结束，成功的完成与整合。你已到达旅程的终点，现在可以庆祝成果并准备新的循环。",
    meaningDown: "未完成的使命、拖延终点。仍有未解决的事项需要处理，在真正结束之前不要急于庆祝。",
    element: "土",
    number: 21,
    imagery:
      "一位舞者悬浮于巨大的月桂花环中，双手各持双头权杖，四角有牛、狮、鹰、人四大生命之灵守护——愚人之旅的终点是成为世界的中心。",
  },
])

/* ------------------------------------------------------------------ */
/*  权杖（Wands）— 火元素，行动 / 创造 / 事业                        */
/* ------------------------------------------------------------------ */
const WANDS: Card[] = buildCards([
  {
    id: "wands_01",
    nameZh: "权杖王牌",
    nameEn: "Ace of Wands",
    suit: Suit.Wands,
    keywords: ["灵感", "新起点", "创造力", "激情"],
    meaningUp: "新的热情、创意或事业机遇正在点燃。这是行动的号角，抓住灵感的火花开始一段激动人心的旅程。",
    meaningDown: "创意受阻、缺乏动力或计划延迟。需要耐心等待火种重新点燃，不要强行点燃潮湿的木柴。",
    element: "火",
    number: 1,
    imagery:
      "云中伸出一只右手紧握一根粗壮的权杖，顶端萌发出几片翠绿新叶，八片落叶飘散在空中，远处是翠绿山丘与城堡。",
  },
  {
    id: "wands_02",
    nameZh: "权杖二",
    nameEn: "Two of Wands",
    suit: Suit.Wands,
    keywords: ["规划", "展望", "选择", "扩张"],
    meaningUp: "站在高处规划未来，世界在你脚下。需要做出扩张性的选择，勇敢地走出舒适区。",
    meaningDown: "恐惧未知、计划受阻或不愿离开熟悉的地方。过度的谨慎会让你错失良机。",
    element: "火",
    number: 2,
    imagery:
      "一位领主站在城堡塔楼上，一手持地球仪，一手扶着身后的权杖，另一根权杖固定在墙侧，远眺大海与远方的船只。",
  },
  {
    id: "wands_03",
    nameZh: "权杖三",
    nameEn: "Three of Wands",
    suit: Suit.Wands,
    keywords: ["远见", "探索", "合作", "进展"],
    meaningUp: "你的计划正在扩展，远见带来了新的合作伙伴与机遇。等待船队归来，成功的信号正在靠近。",
    meaningDown: "进展缓慢、合作不力或缺乏远见。需要重新评估你的策略，检查是否忽略了必要的准备工作。",
    element: "火",
    number: 3,
    imagery:
      "一位旅人背对观众站在悬崖边眺望大海，三根权杖牢牢插在岩石地面，远处有三艘帆船正向岸边驶来。",
  },
  {
    id: "wands_04",
    nameZh: "权杖四",
    nameEn: "Four of Wands",
    suit: Suit.Wands,
    keywords: ["庆祝", "归属", "安定", "和谐"],
    meaningUp: "辛勤工作换来的庆祝时刻。家庭或团队的和谐根基稳固，享受这充满归属感的丰收喜悦。",
    meaningDown: "不安定、庆祝被取消或基础尚不牢固。表面的和谐下可能存在隐患，需要加固根基。",
    element: "火",
    number: 4,
    imagery:
      "四根权杖搭成花环拱门庆典棚架，两位女子高举花束在棚下欢舞，远处有一座城堡在蓝天下矗立。",
  },
  {
    id: "wands_05",
    nameZh: "权杖五",
    nameEn: "Five of Wands",
    suit: Suit.Wands,
    keywords: ["竞争", "冲突", "混乱", "多样性"],
    meaningUp: "多个力量相互碰撞，竞争带来压力也带来成长。混乱中的每个人都有自己的观点，需要找到建设性的出口。",
    meaningDown: "避免冲突、化解争议或寻找共识。过于激烈的竞争会消耗团队能量，是时候寻求和平了。",
    element: "火",
    number: 5,
    imagery:
      "五个年轻人各持一根权杖互相搅打，权杖的方向各异——有的在上有的在下，混乱中却没有真正伤到任何人，更像一场热烈的竞争。",
  },
  {
    id: "wands_06",
    nameZh: "权杖六",
    nameEn: "Six of Wands",
    suit: Suit.Wands,
    keywords: ["胜利", "认可", "声誉", "赞美"],
    meaningUp: "你获得了公众的认可与赞扬，骑着胜利的骏马凯旋归来。享受这一刻的荣耀，但保持谦逊。",
    meaningDown: "失去声誉、傲慢或期待落空。胜利是暂时的，不要被掌声冲昏头脑，或是成功后后继无力。",
    element: "火",
    number: 6,
    imagery:
      "一位骑士头戴桂冠骑白马凯旋归来，手中权杖也系着桂冠花环，他的五名追随者高举权杖在旁步行，所有人穿着红衣。",
  },
  {
    id: "wands_07",
    nameZh: "权杖七",
    nameEn: "Seven of Wands",
    suit: Suit.Wands,
    keywords: ["防守", "坚持", "逆境", "挑战"],
    meaningUp: "面对众多挑战者，你站稳阵地坚持自己的立场。虽然压力巨大，但你有足够的勇气和策略守住位置。",
    meaningDown: "不堪重负、放弃立场或疲惫不堪。孤军奋战也许不是最好的选择，考虑战略性撤退或寻求支援。",
    element: "火",
    number: 7,
    imagery:
      "一个人站在山顶挥动权杖防守高地，山下有六根权杖如长矛般向他刺来，他穿着一身绿衣和一只棕色靴子在岩石上站稳脚跟。",
  },
  {
    id: "wands_08",
    nameZh: "权杖八",
    nameEn: "Eight of Wands",
    suit: Suit.Wands,
    keywords: ["速度", "进展", "行动", "通信"],
    meaningUp: "事情正在迅速推进，像是天空中疾飞的利箭。变化与通信的加速期，一切都在快速就位。",
    meaningDown: "延误、沟通不畅或计划突然中断。加速的过程被外部因素打断，需要耐心等待风向转变。",
    element: "火",
    number: 8,
    imagery:
      "八根权杖以对角线方向疾飞过翠绿的乡村与原野，朝向远处的河川，没有人物——只有纯粹的速度与动能。",
  },
  {
    id: "wands_09",
    nameZh: "权杖九",
    nameEn: "Nine of Wands",
    suit: Suit.Wands,
    keywords: ["坚持", "韧性", "警惕", "最后防线"],
    meaningUp: "伤痕累累但依然坚守。这是最后的防线，你的韧性正在被极限考验，不要放弃，因为终点就在眼前。",
    meaningDown: "筋疲力竭、偏执或过于防御。长期的压力让你身心俱疲，也许需要信任他人来分担负担。",
    element: "火",
    number: 9,
    imagery:
      "一个人缠着头部和手臂的白色绷带，双手紧握一根权杖，疲惫但仍然警觉，身后八根权杖如栅栏般排成一堵防护墙。",
  },
  {
    id: "wands_10",
    nameZh: "权杖十",
    nameEn: "Ten of Wands",
    suit: Suit.Wands,
    keywords: ["重负", "压力", "责任", "负荷"],
    meaningUp: "背负了太多责任，承受着沉重的压力。虽然你咬牙坚持，但过度的负担正在消耗你的能量。",
    meaningDown: "放下重担、学会委派或承认极限。没有人能独自背负一切，学会说『不』并优先分配给他人。",
    element: "火",
    number: 10,
    imagery:
      "一个人弯腰背负十根捆束的权杖，被沉重的担子压得几乎看不见前方的路，但他仍在向远处的城镇前行。",
  },
  {
    id: "wands_11",
    nameZh: "权杖侍从",
    nameEn: "Page of Wands",
    suit: Suit.Wands,
    keywords: ["探索", "热情", "消息", "新发现"],
    meaningUp: "带着热情探索新领域的信使。一个激动人心的新消息或新兴趣即将到来，保持开放与好奇心。",
    meaningDown: "缺乏方向、三分钟热度或坏消息。冲动的行动缺乏持久力，需要找到真正值得投入的方向。",
    element: "火",
    number: 11,
    imagery:
      "一个身穿金色外套的少年站在沙漠中，双手扶着一根比自己还高的权杖，充满向往地仰望权杖顶端，背景是荒芜但广阔的金色大地。",
  },
  {
    id: "wands_12",
    nameZh: "权杖骑士",
    nameEn: "Knight of Wands",
    suit: Suit.Wands,
    keywords: ["冒险", "冲动", "魅力", "行动派"],
    meaningUp: "充满魅力与冒险精神的行动者。以惊人的速度冲向目标，热情洋溢但也要留意火势蔓延的速度。",
    meaningDown: "鲁莽、半途而废或精力分散。高速的冲刺缺乏耐力，需要更稳定的节奏和持续的专注。",
    element: "火",
    number: 12,
    imagery:
      "一位身穿红色火焰图案铠甲的骑士骑着烈马飞驰，手持一根冒出火花和绿叶的权杖，眼神燃着无所畏惧的火光。",
  },
  {
    id: "wands_13",
    nameZh: "权杖王后",
    nameEn: "Queen of Wands",
    suit: Suit.Wands,
    keywords: ["自信", "温暖", "果断", "魅力领导"],
    meaningUp: "热情洋溢、充满自信的领导者。你的感染力与果断决策力激励着他人，温暖的魅力照亮了周围的一切。",
    meaningDown: "嫉妒、自我中心或脾气暴躁。自信的火花若不加控制会变成吞噬一切的火焰，需要内省与平衡。",
    element: "火",
    number: 13,
    imagery:
      "她坐在装饰着狮子扶手的金色王座上，一手持向日葵一手持权杖，脚边有一只黑猫正对前方，身穿金色长袍，整个人散发着温暖的光芒。",
  },
  {
    id: "wands_14",
    nameZh: "权杖国王",
    nameEn: "King of Wands",
    suit: Suit.Wands,
    keywords: ["领导力", "远见", "创业", "荣誉"],
    meaningUp: "成熟的创业家与领袖，以远见与勇气开创事业。你拥有激励他人的魅力和将愿景变为现实的能力。",
    meaningDown: "傲慢、专制或过高期望。强势的领导如果缺乏耐心会变成独裁，需要检查自己的底线与同理心。",
    element: "火",
    number: 14,
    imagery:
      "他坐在装饰着火蝾螈的宝座上，身穿火焰橙长袍与绿色披风，手持权杖，眼神坚定而充满远见——一个真正的领导者。",
  },
])

/* ------------------------------------------------------------------ */
/*  圣杯（Cups）— 水元素，情感 / 关系 / 直觉                          */
/* ------------------------------------------------------------------ */
const CUPS: Card[] = buildCards([
  {
    id: "cups_01",
    nameZh: "圣杯王牌",
    nameEn: "Ace of Cups",
    suit: Suit.Cups,
    keywords: ["爱", "情感开端", "直觉", "丰沛"],
    meaningUp: "爱的浪潮正在心中涌动。新的感情关系或创意灵感正在孕育，你的内心充满了情感的丰盈。",
    meaningDown: "情感枯竭、爱的阻塞或压抑感受。内心的井暂时干涸了，需要先照顾好自己的情感需求。",
    element: "水",
    number: 1,
    imagery:
      "云中伸出一只右手托起一只精致的金质圣杯，五道水流从杯中涌出落入下方铺满睡莲的水池，一只白鸽衔着硬币从天而降飞向杯中。",
  },
  {
    id: "cups_02",
    nameZh: "圣杯二",
    nameEn: "Two of Cups",
    suit: Suit.Cups,
    keywords: ["联结", "平等", "吸引", "合一"],
    meaningUp: "两颗心的平等相遇与深度联结。无论是爱情还是友谊，这段关系建立在相互尊重与真诚的基础上。",
    meaningDown: "分离、关系不平等或沟通断裂。联结的能量受阻，需要诚实地面对关系中的失衡。",
    element: "水",
    number: 2,
    imagery:
      "一少年与一少女人手持圣杯面对彼此，少年伸出手似乎要触碰少女的手，少女穿着飘逸的长裙，两人之间悬浮着一只有翼双蛇杖——赫尔墨斯的象征。",
  },
  {
    id: "cups_03",
    nameZh: "圣杯三",
    nameEn: "Three of Cups",
    suit: Suit.Cups,
    keywords: ["庆祝", "友谊", "丰收", "姐妹情"],
    meaningUp: "与朋友一起庆祝丰收的喜悦。分享快乐让快乐加倍，社交与集体活动带来了满足与幸福。",
    meaningDown: "过度放纵、社交疲惫或友谊中的嫉妒。宴会的喧闹掩盖了内在的空虚，需要适当的节制。",
    element: "水",
    number: 3,
    imagery:
      "三位少女高举圣杯在丰盛的果园中舞动，地上铺满南瓜、葡萄与果实，她们围绕彼此形成了一个欢快而亲密的圆圈。",
  },
  {
    id: "cups_04",
    nameZh: "圣杯四",
    nameEn: "Four of Cups",
    suit: Suit.Cups,
    keywords: ["冥想", "冷漠", "不满", "内省"],
    meaningUp: "对眼前的机会视而不见，沉浸在不满与冷漠中。一只无形的手从云端递来了新的可能性，你却没有看见。",
    meaningDown: "觉醒行动、抓住新机会。从麻木中苏醒，你终于注意到了那个被忽略的邀请。",
    element: "水",
    number: 4,
    imagery:
      "一个人盘腿坐在树下，双臂交叉，低垂着头，面前的地上立着三只杯子，一只云中伸出的手递来第四只杯子，但他没有理会。",
  },
  {
    id: "cups_05",
    nameZh: "圣杯五",
    nameEn: "Five of Cups",
    suit: Suit.Cups,
    keywords: ["失落", "悲伤", "遗憾", "放下"],
    meaningUp: "注视着洒落的酒杯沉浸在悲伤中，却没有注意到身后依然立着的两只杯子。允许自己悲伤，但不要忘记仍有希望。",
    meaningDown: "接受现实、开始疗愈。接受损失并向前看，新的可能性正在地平线出现。",
    element: "水",
    number: 5,
    imagery:
      "一个披着黑色斗篷的人垂下头凝视地上三只倒下的红色圣杯——其中的红色液体已经洒出，身后还有两只立着的杯子，远处有一条河流和一座拱桥。",
  },
  {
    id: "cups_06",
    nameZh: "圣杯六",
    nameEn: "Six of Cups",
    suit: Suit.Cups,
    keywords: ["怀旧", "纯真", "回忆", "善意"],
    meaningUp: "回到纯真的过去，与旧友重逢或重温美好的回忆。慷慨的善意与无私的给予带来了温暖。",
    meaningDown: "沉溺于过去、停滞不前或拒绝长大。停留在回忆中会让你错过当下真实的生活。",
    element: "水",
    number: 6,
    imagery:
      "一个大孩子向一个小孩子递上一只装满白色百合花的圣杯，背景是一栋带有十字护墙的石屋，温暖的画面散发着童真与善意。",
  },
  {
    id: "cups_07",
    nameZh: "圣杯七",
    nameEn: "Seven of Cups",
    suit: Suit.Cups,
    keywords: ["幻象", "选择", "欲望", "白日梦"],
    meaningUp: "面前有多个诱人的可能性，但不是所有闪闪发光的东西都是金子。需要辨别真实的机会与虚妄的幻象。",
    meaningDown: "聚焦现实、做出决定。幻象逐渐散去，你开始看清什么是真正重要的，并愿意做出承诺。",
    element: "水",
    number: 7,
    imagery:
      "七个圣杯漂浮在云端，杯中分别映出城堡、珠宝、巨蛇、桂冠、巨龙、美人蛇和幽灵面容——象征着七种不同的欲望与幻想。",
  },
  {
    id: "cups_08",
    nameZh: "圣杯八",
    nameEn: "Eight of Cups",
    suit: Suit.Cups,
    keywords: ["放手", "追求更深", "转变", "精神探索"],
    meaningUp: "离开已经熟悉的情感领域，踏上追求更高精神满足的旅程。放下已知的舒适，追寻内心真正的召唤。",
    meaningDown: "逃避现实、半途而废或害怕离开。放弃一切之前，确认你是在追随灵魂的呼唤而非仅仅不满。",
    element: "水",
    number: 8,
    imagery:
      "一个人背着红色斗篷拄着拐杖走向远方的高山，身后河岸边留下了整齐排列的八只圣杯，他在月夜下踏上了追寻更深意义的旅程。",
  },
  {
    id: "cups_09",
    nameZh: "圣杯九",
    nameEn: "Nine of Cups",
    suit: Suit.Cups,
    keywords: ["满足", "实现", "自豪", "享乐"],
    meaningUp: "梦想成真的满足时刻，被称作『愿望之牌』。情感与物质的双重满足，享受这份来之不易的硕果。",
    meaningDown: "表面光鲜下的空虚、自满或过度追求享乐。外在的满足不能填补内在的空洞。",
    element: "水",
    number: 9,
    imagery:
      "一个衣着讲究的人交叉双手坐在凳子上，身后的弧形长桌上摆满了九只金色圣杯，他面带心满意足的微笑。",
  },
  {
    id: "cups_10",
    nameZh: "圣杯十",
    nameEn: "Ten of Cups",
    suit: Suit.Cups,
    keywords: ["幸福", "圆满", "家庭和谐", "真爱"],
    meaningUp: "最幸福的家庭与情感圆满之牌。彩虹下的幸福家园，代表持久的爱、和谐与情感的终极满足。",
    meaningDown: "家庭冲突、理想破碎或期望落空。所谓的完美家庭表象被打破，需要用真实而非幻想来修复关系。",
    element: "水",
    number: 10,
    imagery:
      "一对夫妇张开双臂仰望天空，两个孩子在草地上欢舞，天边十只圣杯排列成完美弧形的彩虹，远处是安宁的家园和缓缓流动的河水。",
  },
  {
    id: "cups_11",
    nameZh: "圣杯侍从",
    nameEn: "Page of Cups",
    suit: Suit.Cups,
    keywords: ["敏感", "创意", "直觉讯息", "天真"],
    meaningUp: "带着好奇与敏感探索情感世界的信使。创意的灵感或情感的消息即将到来，保持开放心态。",
    meaningDown: "情感不成熟、逃避现实或过度敏感。需要区分情感的表达与情绪的泛滥。",
    element: "水",
    number: 11,
    imagery:
      "一个穿着花卉图案上衣的少年站在海边，右手持圣杯，从杯中跃出一条小鱼，他睁大眼睛惊讶而好奇地看着这条鱼。",
  },
  {
    id: "cups_12",
    nameZh: "圣杯骑士",
    nameEn: "Knight of Cups",
    suit: Suit.Cups,
    keywords: ["浪漫", "追求", "理想主义", "邀请"],
    meaningUp: "浪漫的骑士带着邀请而来。追求理想中的爱与美，跟随内心的热情，但也要保持脚踏实地的清醒。",
    meaningDown: "不切实际、情感欺骗或过度理想化。梦幻的追求如果脱离现实会变成不可靠的空想。",
    element: "水",
    number: 12,
    imagery:
      "一位身穿蓝色铠甲的骑士骑着白马缓缓前行，一手持缰绳一手托举圣杯，姿态庄重而浪漫，羽翼头盔后面的翅膀微微展开。",
  },
  {
    id: "cups_13",
    nameZh: "圣杯王后",
    nameEn: "Queen of Cups",
    suit: Suit.Cups,
    keywords: ["慈悲", "直觉", "疗愈", "理解"],
    meaningUp: "充满慈悲与直觉的守护者。深度的情感理解与疗愈能力，你以温柔和直觉滋养身边的每一个人。",
    meaningDown: "过度敏感、情绪化或自我牺牲。太容易吸收他人的情绪能量会让自己溺水，需要建立情感边界。",
    element: "水",
    number: 13,
    imagery:
      "她坐在海岸边装饰着海中仙女的宝座上，双手捧着一只精雕细琢的圣杯凝视其中，身穿海蓝长袍与白色披风，脚边铺着一片宁静的沙滩。",
  },
  {
    id: "cups_14",
    nameZh: "圣杯国王",
    nameEn: "King of Cups",
    suit: Suit.Cups,
    keywords: ["情感成熟", "睿智", "冷静", "外交"],
    meaningUp: "情感上成熟稳重的领袖。以冷静与智慧驾驭情绪的海洋，既有深度又有自制力。",
    meaningDown: "情感压抑、情绪不稳或操控他人。表面的平静掩盖了内心的风暴，需要健康的情感表达渠道。",
    element: "水",
    number: 14,
    imagery:
      "他坐在海面上的王座上，身穿蓝色长袍和金色披风，一手持圣杯一手持权杖，脚下海涛起伏，但面容平静——他以智慧驾驭着情感之海。",
  },
])

/* ------------------------------------------------------------------ */
/*  宝剑（Swords）— 风元素，思想 / 沟通 / 挑战                        */
/* ------------------------------------------------------------------ */
const SWORDS: Card[] = buildCards([
  {
    id: "swords_01",
    nameZh: "宝剑王牌",
    nameEn: "Ace of Swords",
    suit: Suit.Swords,
    keywords: ["真理", "突破", "清晰", "正义之剑"],
    meaningUp: "锋利的理智之剑划破迷雾。清晰的思维与真理的突破时刻到了，用智慧的力量做出正确的决定。",
    meaningDown: "混淆、错误的判断或滥用智力。剑的双刃需要小心使用，确保你的思维没有被偏见所蒙蔽。",
    element: "风",
    number: 1,
    imagery:
      "云中伸出一只右手紧握一把直立的利剑，剑尖穿过金色皇冠，剑身两侧各挂着一根橄榄枝和一根棕榈叶，远处是荒芜的高山与蓝天。",
  },
  {
    id: "swords_02",
    nameZh: "宝剑二",
    nameEn: "Two of Swords",
    suit: Suit.Swords,
    keywords: ["僵局", "回避", "抉择", "平衡"],
    meaningUp: "蒙着眼睛面对两把交叉的剑，内心在艰难的抉择中保持平衡。你需要看到真相，而不是回避选择。",
    meaningDown: "信息过载、做出决定或打破僵局。蒙眼的布即将被揭开，是时候直面那个你一直回避的决定了。",
    element: "风",
    number: 2,
    imagery:
      "一位女子蒙着白色眼罩坐在石凳上，身穿白袍，双手各持一把长剑交叉在胸前，身后是平静的湖水与一弯新月，暗示她只看内在而不看外界。",
  },
  {
    id: "swords_03",
    nameZh: "宝剑三",
    nameEn: "Three of Swords",
    suit: Suit.Swords,
    keywords: ["心碎", "痛苦", "失落", "真相之痛"],
    meaningUp: "三把剑穿透心脏，代表着心碎、痛苦与悲伤。但穿透心脏的剑也意味着真相刺破了幻象。",
    meaningDown: "释放痛苦、情绪宣泄或开始愈合。伤口正在清理，这是痊愈的必经阶段，雨后会天晴。",
    element: "风",
    number: 3,
    imagery:
      "三把利剑穿透一颗红心，剑尖从心背面穿出，厚重的灰色乌云背景中雨水滂沱——这是理智之剑刺穿了情感的幻象。",
  },
  {
    id: "swords_04",
    nameZh: "宝剑四",
    nameEn: "Four of Swords",
    suit: Suit.Swords,
    keywords: ["休息", "冥想", "恢复", "避难"],
    meaningUp: "战斗后的必要休息。在精神或情感的战场上暂时撤退，给自己时间恢复能量与思绪。",
    meaningDown: "倦怠、无法安宁或过早行动。内心的不安分让你无法真正休息，没有恢复就重新投入战斗只会透支。",
    element: "风",
    number: 4,
    imagery:
      "一个人合十安卧于教堂的石棺之上，上方墙上横向挂着三把剑，侧面还有一把，彩色玻璃窗透进安静的光——精神战斗之后的深度休息。",
  },
  {
    id: "swords_05",
    nameZh: "宝剑五",
    nameEn: "Five of Swords",
    suit: Suit.Swords,
    keywords: ["冲突", "败局", "损失", "空欢喜"],
    meaningUp: "赢了战斗却输了人心的空洞胜利。冲突带来的伤害超过了胜利的价值，审视你的好胜心是否值得。",
    meaningDown: "放下冲突、和解或向前看。过去的争执正在消散，接受损失并选择一条更和平的道路。",
    element: "风",
    number: 5,
    imagery:
      "三个人站在萧瑟的海边——前面一个人抱着三把剑冷笑，地上的两把剑散落着，后面两个落败者背对镜头走向远方，天空被乌云压得低沉。",
  },
  {
    id: "swords_06",
    nameZh: "宝剑六",
    nameEn: "Six of Swords",
    suit: Suit.Swords,
    keywords: ["过渡", "疗愈之旅", "放下", "前进"],
    meaningUp: "乘船渡向平静的水域，告别过去的伤痛。虽然行李沉重，但前方有更安宁的土地。",
    meaningDown: "无法前行、抗拒过渡或沉溺于过去。船已经离岸，回头太难，唯有向前才能到达彼岸。",
    element: "风",
    number: 6,
    imagery:
      "一个船夫撑着杆推船前行，船上坐着一个披着斗篷的孩子般的身影，船头插着六把宝剑代表沉重的思想行李，向远方平静的岛屿驶去。",
  },
  {
    id: "swords_07",
    nameZh: "宝剑七",
    nameEn: "Seven of Swords",
    suit: Suit.Swords,
    keywords: ["策略", "隐秘", "欺骗", "智取"],
    meaningUp: "偷偷带走五把剑，用智谋而非蛮力解决问题。策略性的撤退或隐瞒可能是必要的，但注意不要越界。",
    meaningDown: "谎言暴露、自食恶果或诚实面对。秘密行动可能被发现，坦白与真诚才是长久之计。",
    element: "风",
    number: 7,
    imagery:
      "一个人抱着五把剑从敌人的帐篷溜走，回头一望露出狡黠的笑容，身后地上还插着两把未带走的剑——一个用智谋而非正面交锋解决问题的场景。",
  },
  {
    id: "swords_08",
    nameZh: "宝剑八",
    nameEn: "Eight of Swords",
    suit: Suit.Swords,
    keywords: ["束缚", "自我设限", "无力感", "被困"],
    meaningUp: "被蒙住双眼束缚在剑林之中。但仔细看，束缚你的绳子实际上很松——你被困住是因为你认为自己被困。",
    meaningDown: "释放自我、看清真相或找到出路。蒙眼的布正在松开，你意识到那些限制大多是自我施加的。",
    element: "风",
    number: 8,
    imagery:
      "一个蒙着眼睛的女子被松散的绳索绑在八把插入湿地的剑之间——剑围成了牢笼，但绳子其实很松，脚下是泥土而不是深渊，她只要挣脱就可以离开。",
  },
  {
    id: "swords_09",
    nameZh: "宝剑九",
    nameEn: "Nine of Swords",
    suit: Suit.Swords,
    keywords: ["焦虑", "噩梦", "忧虑", "失眠"],
    meaningUp: "深夜被噩梦惊醒，忧虑像墙上的剑一样令人窒息。最黑暗的时刻往往在黎明之前，这些恐惧大多存在于你的脑海中。",
    meaningDown: "克服恐惧、寻求帮助或放下负担。黑暗正在退散，寻求支持会让你意识到自己不是孤单一人。",
    element: "风",
    number: 9,
    imagery:
      "一个人在深夜从床上坐起，双手捂着脸，墙上平行挂着九把沉重的剑——但仔细看，这些剑并不在他身上，它们只是悬在他的想象中。",
  },
  {
    id: "swords_10",
    nameZh: "宝剑十",
    nameEn: "Ten of Swords",
    suit: Suit.Swords,
    keywords: ["终结", "谷底", "背刺", "重创"],
    meaningUp: "背上插满十把剑的终结者。看似最惨烈的画面，却也意味着谷底之后唯有向上——再也不会有更糟的情况了。",
    meaningDown: "绝处逢生、重建或缓慢恢复。最糟糕的时刻已经过去，从灰烬中学习教训，重新站起来。",
    element: "风",
    number: 10,
    imagery:
      "一个人趴在地上，背上被十把剑钉穿——但远处地平线上曙光正在升起，黑暗的天空有一半被金色穿透。这看似最惨烈的牌，其实在说：黎明将至。",
  },
  {
    id: "swords_11",
    nameZh: "宝剑侍从",
    nameEn: "Page of Swords",
    suit: Suit.Swords,
    keywords: ["好奇", "思想", "沟通", "警觉"],
    meaningUp: "手持利剑的哨兵，警惕而敏锐。新的想法或信息正在路上，保持开放的心态去学习和探索。",
    meaningDown: "八卦、口无遮拦或未成熟的计划。言辞的利刃可能伤人，需要三思而后言。",
    element: "风",
    number: 11,
    imagery:
      "一个少年站在风起云涌的山丘上，双手举剑过头，双脚没有站稳，像是在训练中调整姿态——头脑灵敏但尚未掌握平衡的学徒。",
  },
  {
    id: "swords_12",
    nameZh: "宝剑骑士",
    nameEn: "Knight of Swords",
    suit: Suit.Swords,
    keywords: ["冲刺", "果断", "理论", "行动派"],
    meaningUp: "以惊人的速度冲向战场的思想战士。行动力与决断力极强，但也要注意不要冲动过头伤了人。",
    meaningDown: "鲁莽、傲慢或言语伤人。高速冲刺如果没有方向感只会撞墙，需要减速并考虑他人的感受。",
    element: "风",
    number: 12,
    imagery:
      "一位全身铠甲骑士策马狂冲，长剑直指前方，马鬃和骑士披风被风猛烈撕裂，背景是翻滚的雷暴云——速度与果断的化身。",
  },
  {
    id: "swords_13",
    nameZh: "宝剑王后",
    nameEn: "Queen of Swords",
    suit: Suit.Swords,
    keywords: ["独立", "洞察", "公正", "清晰表达"],
    meaningUp: "透过表象看穿本质的独立思考者。你的敏锐洞察与清晰表达让你在复杂局面中保持公正与理性。",
    meaningDown: "刻薄、冷漠或过度批判。锋利的洞察如果没有温情的包裹会变成伤人的利器。",
    element: "风",
    number: 13,
    imagery:
      "她身穿蓝袍坐在王座上，一手直举长剑，一手平伸做掌，面容严肃但平静，蝴蝶与云朵装饰着椅背——她将以理智和清晰切割一切混乱。",
  },
  {
    id: "swords_14",
    nameZh: "宝剑国王",
    nameEn: "King of Swords",
    suit: Suit.Swords,
    keywords: ["权威", "逻辑", "专业", "实话实说"],
    meaningUp: "以理性与智慧统领全局的权威者。逻辑清晰的决策者，用经验和专业知识做出最公正的判断。",
    meaningDown: "专制、冷酷或滥用权力。理性的力量若缺少人性温度会变得冷酷无情。",
    element: "风",
    number: 14,
    imagery:
      "他坐在高背王座上，手握长剑直立，身穿蓝色长袍和紫色披风，面色沉稳而严厉，背后蝴蝶飞舞——逻辑与思想的至高权威。",
  },
])

/* ------------------------------------------------------------------ */
/*  星币（Pentacles）— 土元素，物质 / 事业 / 健康                     */
/* ------------------------------------------------------------------ */
const PENTACLES: Card[] = buildCards([
  {
    id: "pentacles_01",
    nameZh: "星币王牌",
    nameEn: "Ace of Pentacles",
    suit: Suit.Pentacles,
    keywords: ["新财务", "机遇", "物质开端", "落地"],
    meaningUp: "一颗闪耀的金币从云端落下。财务或事业的新机遇正在到来，是播种物质丰盛的好时机。",
    meaningDown: "错失良机、财务决策不佳或延迟的收益。需要重新审视你的财务计划，也许基础尚未扎实。",
    element: "土",
    number: 1,
    imagery:
      "云中伸出一只右手托着一颗巨大的金色五角星币，下方是一条开满百合花与白玫瑰的拱门花园小径，远处是青山与蓝天——物质丰盛的礼物从云端而来。",
  },
  {
    id: "pentacles_02",
    nameZh: "星币二",
    nameEn: "Two of Pentacles",
    suit: Suit.Pentacles,
    keywords: ["平衡", "适应", "多任务", "变化"],
    meaningUp: "灵活地在多重责任之间保持平衡。生活的潮起潮落中你需要调整步伐，保持柔韧与适应力。",
    meaningDown: "不堪重负、财务混乱或失去平衡。太多的球在空中飞舞，可能需要放下一些来保持稳定。",
    element: "土",
    number: 2,
    imagery:
      "一个年轻商人在海边舞动着两个相连的星币，头戴高帽，手边有无限∞符号——他正灵巧地在生活与财务的双重责任间保持平衡，远处有两艘帆船。",
  },
  {
    id: "pentacles_03",
    nameZh: "星币三",
    nameEn: "Three of Pentacles",
    suit: Suit.Pentacles,
    keywords: ["合作", "技艺", "团队", "学徒"],
    meaningUp: "工匠与建筑师在教堂中协作。团队合作与专业技能的结合创造出超越个人的成果。",
    meaningDown: "缺乏团队精神、技能不足或质量低下。合作出现了摩擦，需要检查沟通与各自的专业水准。",
    element: "土",
    number: 3,
    imagery:
      "一个石匠站在长凳上用力雕凿教堂的柱子，建筑师和僧侣在下方举着图纸与之讨论——三人协作建造一座神的殿堂。",
  },
  {
    id: "pentacles_04",
    nameZh: "星币四",
    nameEn: "Four of Pentacles",
    suit: Suit.Pentacles,
    keywords: ["守财", "控制", "吝啬", "稳定"],
    meaningUp: "紧紧抱住金币不放。财务稳定是好事，但过度控制会阻碍财富流动。检查你是否在过于吝啬。",
    meaningDown: "过度慷慨、财务失控或放手。需要找到一个给予与保留之间的健康平衡。",
    element: "土",
    number: 4,
    imagery:
      "一个人坐在凳子上，头上顶着一枚星币，双手各抱一枚，脚下还踩着两枚——他把自己与星币死死绑在一起，背景是一座灰色城市。",
  },
  {
    id: "pentacles_05",
    nameZh: "星币五",
    nameEn: "Five of Pentacles",
    suit: Suit.Pentacles,
    keywords: ["贫困", "失落", "孤立", "困难"],
    meaningUp: "在寒冬中走过教堂的窗外。物质匮乏或健康困扰的时刻，需要鼓起勇气寻求帮助。",
    meaningDown: "走出困境、找到援助。最困难的时期正在过去，门正在为你打开，不要羞于伸手。",
    element: "土",
    number: 5,
    imagery:
      "两个衣着褴褛的人在雪地里蹒跚走过明亮的教堂彩色玻璃窗下，一人拄着拐杖一人披着破披肩——他们没有注意到教堂的门其实开着，灯光就在几步之外。",
  },
  {
    id: "pentacles_06",
    nameZh: "星币六",
    nameEn: "Six of Pentacles",
    suit: Suit.Pentacles,
    keywords: ["慷慨", "分享", "慈善", "互惠"],
    meaningUp: "一个给、一个收。慷慨的分享与资源的重新分配，无论是给予还是接受，都在流动中找到平衡。",
    meaningDown: "不平等、债务或依赖关系。资源分配的不公平正在显现，需要检查是否处于不健康的不对等关系。",
    element: "土",
    number: 6,
    imagery:
      "一个穿着华丽的富人手持天秤将金币分发给跪在地上的两个穷人——他的左手在平衡分配，右手在给予，寓意公平与慷慨并存。",
  },
  {
    id: "pentacles_07",
    nameZh: "星币七",
    nameEn: "Seven of Pentacles",
    suit: Suit.Pentacles,
    keywords: ["评估", "投资", "耐心", "收获"],
    meaningUp: "停下脚步审视已经生长的作物。投资的成果尚需时日才能完全收获，需要耐心等待。",
    meaningDown: "浪费、失望或缺乏回报。辛勤的付出似乎没有得到应有的回报，需要重新评估你的投入方向。",
    element: "土",
    number: 7,
    imagery:
      "一个人倚着长杖凝视面前结了六枚金色星币的藤蔓——绿叶葱茏，六枚已经成熟，还有一枚似乎还在生长中，他正在耐心评估何时是最佳收获时机。",
  },
  {
    id: "pentacles_08",
    nameZh: "星币八",
    nameEn: "Eight of Pentacles",
    suit: Suit.Pentacles,
    keywords: ["精进", "专注", "技能", "勤奋"],
    meaningUp: "全神贯注地打磨每一枚金币。精进技艺与勤奋工作的时刻，专注于做好每一件小事。",
    meaningDown: "敷衍了事、缺乏动力或职业倦怠。对工作失去了热情，需要重新找到学习的意义。",
    element: "土",
    number: 8,
    imagery:
      "一个工匠坐在长凳上全神贯注地用锤子和凿子雕刻星币，墙上挂着六枚他已完成的精美作品，一枚正在他手中成形——专注与技艺的完美展现。",
  },
  {
    id: "pentacles_09",
    nameZh: "星币九",
    nameEn: "Nine of Pentacles",
    suit: Suit.Pentacles,
    keywords: ["富足", "自律", "独立", "优雅"],
    meaningUp: "通过自律与智慧累积的富足，享受独立与优雅的生活。",
    meaningDown: "表面风光、依赖他人或财务隐患。花园虽然美丽，但围墙之外可能有你忽略的风险。",
    element: "土",
    number: 9,
    imagery:
      "一位身穿丝绸长袍的贵妇独自站在繁花盛开的葡萄园中，一只鹦鹉停在她戴着手套的左手上，脚下铺满了金色星币——她以自律与智慧换来了这一切。",
  },
  {
    id: "pentacles_10",
    nameZh: "星币十",
    nameEn: "Ten of Pentacles",
    suit: Suit.Pentacles,
    keywords: ["传承", "家族", "遗产", "长久繁荣"],
    meaningUp: "世代传承的富裕与稳定的家族根基。建立持久的财富或遗产，家族的繁荣代代相传。",
    meaningDown: "家族纷争、破产或传承断裂。表面的富足下家族关系出现问题，金钱不能解决所有问题。",
    element: "土",
    number: 10,
    imagery:
      "白发祖父在拱门下与爱人交谈，一对年轻夫妇带着孩子站在前方，孩子好奇地抓爷爷的尾巴——十枚星币排列成生命树图案贯穿整个画面，展现世代传承。",
  },
  {
    id: "pentacles_11",
    nameZh: "星币侍从",
    nameEn: "Page of Pentacles",
    suit: Suit.Pentacles,
    keywords: ["勤勉", "学习", "实践", "脚踏实地"],
    meaningUp: "专注学习一门实用技能的学徒。脚踏实地的态度与对新知识的渴望会带来实实在在的成长。",
    meaningDown: "拖延、不切实际或缺乏计划。学习的热情如果没有扎实的行动只会停留在空想阶段。",
    element: "土",
    number: 11,
    imagery:
      "一个少年独自站在鲜花点缀的草地上，双手高举一枚金色星币凝视上方——他是脚踏实地学习物质世界之道的学徒，眼中满是对成长的渴望。",
  },
  {
    id: "pentacles_12",
    nameZh: "星币骑士",
    nameEn: "Knight of Pentacles",
    suit: Suit.Pentacles,
    keywords: ["稳健", "可靠", "谨慎", "工作狂"],
    meaningUp: "最可靠的骑士，稳步前进从不懈怠。负责而务实，虽然速度不快但每一步都扎实。",
    meaningDown: "停滞、固执或缺乏想象力。过于谨慎变成了僵化，偶尔需要跳出常规看看更广阔的视野。",
    element: "土",
    number: 12,
    imagery:
      "一位身穿厚重铁甲的骑士骑在黑马上于田野间静静站立，手持一枚星币——没有冲刺，没有火焰，只有沉稳和耐心，他的每一步都是扎实的。",
  },
  {
    id: "pentacles_13",
    nameZh: "星币王后",
    nameEn: "Queen of Pentacles",
    suit: Suit.Pentacles,
    keywords: ["养育", "务实", "慷慨", "丰饶"],
    meaningUp: "将家庭与物质打理得井井有条的女主人。务实的关怀与丰饶的慷慨，为所爱之人创造温暖舒适的环境。",
    meaningDown: "忽视家庭、物质主义或自我照顾不足。过于关注外在丰盛而忽略了自己的内在需求。",
    element: "土",
    number: 13,
    imagery:
      "她坐在石雕王座上，怀抱一枚巨大的金色星币，周围环绕着盛开的玫瑰、茂盛的藤蔓和翠绿的森林——她是物质世界丰饶与慷慨的化身。",
  },
  {
    id: "pentacles_14",
    nameZh: "星币国王",
    nameEn: "King of Pentacles",
    suit: Suit.Pentacles,
    keywords: ["富足", "稳定", "成功", "良善管理者"],
    meaningUp: "物质世界的成熟王者。通过智慧与勤奋积累了真正的财富与地位，以慷慨与务实管理一切。",
    meaningDown: "贪婪、挥霍或财务上的傲慢。成功若让人迷失自我，再多的财富也无法带来真正的满足。",
    element: "土",
    number: 14,
    imagery:
      "他坐在葡萄藤环绕的王座上，身披绣满金色葡萄串的厚重长袍，一手持星币权杖，一手放在膝上——物质王国的沉稳君王，财富与智慧的双重成熟。",
  },
])

/* ===== 全量牌组（imagePath 已在各 suit 数组中注入） ===== */
export const CARDS: Card[] = [...MAJOR, ...WANDS, ...CUPS, ...SWORDS, ...PENTACLES]

/* ===== 辅助函数 ===== */

/** 按 ID 查找单张牌 */
export function getCardById(id: string): Card | undefined {
  return CARDS.find((card) => card.id === id)
}

/** 按花色筛选 */
export function getCardsBySuit(suit: Suit): Card[] {
  return CARDS.filter((card) => card.suit === suit)
}

/** 按花色分组 */
export function getCardsGroupedBySuit(): Record<Suit, Card[]> {
  return {
    [Suit.Major]: MAJOR,
    [Suit.Wands]: WANDS,
    [Suit.Cups]: CUPS,
    [Suit.Swords]: SWORDS,
    [Suit.Pentacles]: PENTACLES,
  }
}

/** 大阿卡纳 */
export const MAJOR_CARDS = MAJOR

/** 权杖牌组 */
export const WANDS_CARDS = WANDS

/** 圣杯牌组 */
export const CUPS_CARDS = CUPS

/** 宝剑牌组 */
export const SWORDS_CARDS = SWORDS

/** 星币牌组 */
export const PENTACLES_CARDS = PENTACLES

/** 牌组数量常量 */
export const TOTAL_CARDS = 78

/** 花色名称映射 */
export const SUIT_NAMES: Record<Suit, string> = {
  [Suit.Major]: "大阿卡纳",
  [Suit.Wands]: "权杖",
  [Suit.Cups]: "圣杯",
  [Suit.Swords]: "宝剑",
  [Suit.Pentacles]: "星币",
}
