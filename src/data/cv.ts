export interface BilingualText {
  zh: string;
  en: string;
}

export interface PublicationItem {
  id: string;
  year: string;
  title: BilingualText;
  authors: BilingualText;
  venue: BilingualText;
  status: BilingualText;
  role: BilingualText;
  summary: BilingualText;
  tags: string[];
  links: {
    label: BilingualText;
    url: string;
  }[];
}

export type ProjectCategory = 'research' | 'opensource' | 'bioinformatics' | 'ai-agent';

export interface ExperienceProjectItem {
  id: string;
  title: BilingualText;
  subtitle: BilingualText;
  organization: BilingualText;
  role: BilingualText;
  period: string;
  categories: ProjectCategory[];
  highlightMetric?: BilingualText;
  bullets: {
    zh: string[];
    en: string[];
  };
  techTags: string[];
  links?: {
    label: BilingualText;
    url: string;
  }[];
}

export interface EducationItem {
  institution: BilingualText;
  department: BilingualText;
  degree: BilingualText;
  period: string;
  gpa: string;
  courses: BilingualText;
  extra?: BilingualText;
}

export interface HonorItem {
  year: string;
  title: BilingualText;
  organization: BilingualText;
  detail: BilingualText;
}


export const siteData = {
  profile: {
    name: {
      zh: '刘一树',
      en: 'Yishu Liu',
    },
    alias: 'JuniorTree',
    headline: {
      zh: '首都师范大学 · 生命科学学院 生物科学（非师范，本科在读）',
      en: 'Undergraduate in Biological Sciences · College of Life Sciences, Capital Normal University',
    },
    tagline: {
      zh: '分子动力学模拟与药物设计 (MD & Drug Discovery) × 生物信息与科学智能 (CompBio & AI for Science)',
      en: 'Molecular Dynamics & Drug Discovery × Computational Biology & Scientific AI Agents',
    },
    bio: {
      zh: '你好，我是刘一树！从物理光电转入生物科学，我热衷于把生命科学与计算机科学结合起来做有意思的事。目前主要开展转录组/蛋白组分析与分子动力学模拟（MD），在泛素生物学实验室聚焦转录因子 Nanog 的蛋白互作（PPI）模拟与位点筛选，同时进行 co-IP、Western Blot 与细胞培养等湿实验训练。未来希望在分子动力学模拟或计算机辅助药物设计（CADD / Drug Discovery）方向继续深造——如果有老师或业界前辈对我的工作感兴趣，非常期待您的联系（求捞捞）！',
      en: 'Hi, I’m Yishu Liu! With an interdisciplinary background (Optoelectronics → Biological Sciences), I love bridging computation and biology. My current work spans transcriptomic/proteomic analysis and Molecular Dynamics (MD) simulations—focusing on protein-protein interaction (PPI) modeling and binding-site screening around transcription factor Nanog, paired with wet-lab training in co-IP, Western Blot, and cell culture. I aim to pursue graduate research in MD simulation and Computer-Aided Drug Design (Drug Discovery). Always open to research opportunities and collaborations!',
    },
    footnote: {
      zh: '幸会！热爱摄影、大自然、科幻策略与 Vibe Coding（Soyo 厨）',
      en: 'Into photography, nature, sci-fi/strategy games & Vibe Coding',
    },
    email: 'yishu.liu@cnu.edu.cn',
    altEmail: 'liueic@ciallo.cv',
    github: 'https://github.com/liueic',
    githubHandle: 'github.com/liueic',
    orcid: '0009-0008-3715-8166',
    orcidUrl: 'https://orcid.org/0009-0008-3715-8166',
    website: 'https://www.juniortree.com',
  },

  researchInterests: [
    {
      zh: '分子动力学模拟与蛋白互作位点筛选 (Molecular Dynamics, PPI Modeling & Drug Discovery)',
      en: 'Molecular Dynamics (MD), PPI Site Screening & Computer-Aided Drug Design',
    },
    {
      zh: '蛋白质翻译后修饰与干湿结合验证 (PTMs, co-IP / Western Blot / 细胞培养)',
      en: 'Post-Translational Modifications (PTMs) & Dry-Wet Lab Validation (co-IP / WB)',
    },
    {
      zh: '多组学分析、高通量对接与质谱智能质控 (Transcriptomics, Proteomics QC & Nextflow/UniDock)',
      en: 'Multi-Omics Analysis, High-Throughput Docking & LC-MS Intelligent QC',
    },
    {
      zh: '科学大模型智能体、生物数据库与高性能计算 (Scientific LLM Agents / MCP & SLURM HPC)',
      en: 'Scientific LLM Agents (MCP), Biological Databases & GPU/SLURM Computing',
    },
  ],

  publications: [
    {
      id: 'ilepbase-mer-2026',
      year: '2026',
      title: {
        zh: 'iLepBase: 面向鳞翅目昆虫的多源整合基因组与生物多样性综合数据库及在线分析平台',
        en: 'iLepBase: A Comprehensive Integrated Genomics and Biodiversity Database with Online Analytical Workflows for Lepidoptera',
      },
      authors: {
        zh: '核心作者 / 第二作者（Second Author，与团队共同完成）',
        en: 'Second Author & Lead Platform Architect (with iLepBase Consortium)',
      },
      venue: {
        zh: 'Molecular Ecology Resources',
        en: 'Molecular Ecology Resources',
      },
      status: {
        zh: '在审 (Under Review)',
        en: 'Under Review',
      },
      role: {
        zh: '共同核心作者（二作）· 负责数据仓库构建、Go Fiber 后端架构与在线生信工具集成',
        en: 'Second Author · Data Warehouse Curation, Go Fiber Backend & Online Bioinformatics Suite',
      },
      summary: {
        zh: '整合 NCBI、GBIF 等多个公共数据库的鳞翅目物种、序列与分布数据，构建标准化数据仓库，并集成 BLAST、基因组浏览、蛋白质三维结构可视化与 AI 辅助物种鉴定等一站式在线科研工具。',
        en: 'Integrates multi-source Lepidoptera records across NCBI and GBIF with rigorous curation and deduplication, offering RESTful APIs alongside integrated BLAST, genome browsing, 3D protein structure visualization, and AI-assisted species identification.',
      },
      tags: ['Molecular Ecology Resources', '2nd Author', 'Bioinformatics Database', 'Lepidoptera'],
      links: [
        {
          label: { zh: 'iLepBase 在线数据库', en: 'iLepBase Website' },
          url: 'https://www.ilepbase.com',
        },
        {
          label: { zh: 'iLepBase GitHub', en: 'iLepBase GitHub' },
          url: 'https://github.com/iLepBase',
        },
      ],
    },
  ] satisfies PublicationItem[],

  experiences: [
    {
      id: 'cnu-ubiquitin-lab',
      title: {
        zh: '转录因子 Nanog 蛋白互作 (PPI) 与翻译后修饰的动力学模拟与实验研究',
        en: 'Molecular Dynamics & Wet-Lab Investigation of Nanog Protein-Protein Interactions and PTMs',
      },
      subtitle: {
        zh: '首都师范大学 · 泛素生物学实验室 (Ubiquitin Biology Laboratory)',
        en: 'Capital Normal University · Ubiquitin Biology Laboratory',
      },
      organization: {
        zh: '首都师范大学',
        en: 'Capital Normal University',
      },
      role: {
        zh: '本科生科研人员（计算模拟 + 湿实验训练）',
        en: 'Undergraduate Researcher (Computational MD & Wet-Lab)',
      },
      period: '2026.09 – Present',
      categories: ['research', 'bioinformatics'],
      highlightMetric: {
        zh: 'MD 分子动力学模拟 × co-IP / WB 干湿实验闭环',
        en: 'MD Simulation × co-IP / Western Blot Dry-Wet Loop',
      },
      bullets: {
        zh: [
          '围绕低分化癌症密切相关的关键转录因子 Nanog，参与蛋白质翻译后修饰（PTM）研究，承担分子动力学（Molecular Dynamics, MD）模拟与蛋白质相互作用（PPI）关键位点的计算分析与筛选。',
          '开展蛋白质互作的湿实验学习与系统训练，包括细胞培养（Cell Culture）、免疫共沉淀（co-IP）与蛋白质印迹（Western Blot）等实验操作，推动计算预测与分子生物学实验协同验证。',
        ],
        en: [
          'Investigating post-translational modifications (PTMs) and protein-protein interactions (PPIs) of the pluripotency transcription factor Nanog in poorly differentiated cancers via Molecular Dynamics (MD) simulations and binding-site screening.',
          'Conducting wet-lab validation training including cell culture, co-immunoprecipitation (co-IP), and Western Blot to bridge computational PPI predictions with experimental assays.',
        ],
      },
      techTags: ['Molecular Dynamics (MD)', 'PPI Screening', 'Nanog / PTM', 'co-IP', 'Western Blot', 'Cell Culture'],
    },
    {
      id: 'guomics-jarvics',
      title: {
        zh: 'JARVICS — 面向大队列 LC-MS 蛋白质组学的质谱状态监控与维修诊断 Agent',
        en: 'JARVICS — AI Agent for Large-Cohort LC-MS Instrument Health Monitoring & Maintenance Diagnosis',
      },
      subtitle: {
        zh: '西湖大学 郭天南实验室 / 蛋白质组复杂科学实验室 (Guomics Lab)',
        en: 'Westlake University · Guomics Laboratory of Proteomic Big Data (PI: Tiannan Guo)',
      },
      organization: {
        zh: '西湖大学 (Westlake University)',
        en: 'Westlake University',
      },
      role: {
        zh: '暑期研习研究员 (Summer Research Intern)',
        en: 'Summer Research Intern',
      },
      period: '2026.07 – 2026.08',
      categories: ['research', 'bioinformatics', 'ai-agent'],
      highlightMetric: {
        zh: '基于 Nature Communications (iDIA-QC) · 质谱故障诊断 Agent',
        en: 'Built on Nature Communications (iDIA-QC) · MS Maintenance Agent',
      },
      bullets: {
        zh: [
          '基于实验室 iDIA-QC 框架，面向大队列蛋白质组学质谱分析场景，利用谱图特征模式（Spectral Pattern）持续监控质谱仪运行状况并识别异常。',
          '核心参与维修诊断 Agent 模块开发：当检测到谱图存在异常模式时，自动分析并向实验操作员定位故障根因、输出针对性的仪器维护与修复动作建议。',
        ],
        en: [
          'Monitored LC-MS instrument health across large-cohort proteomic runs by analyzing spectral patterns built upon the lab’s Nature Communications iDIA-QC framework.',
          'Developed the diagnostic AI Agent module that translates detected spectral anomalies into root-cause explanations and actionable maintenance/repair instructions for instrument operators.',
        ],
      },
      techTags: ['LC-MS Proteomics', 'iDIA-QC', 'AI Agent', 'Fault Diagnosis', 'Quality Control'],
    },
    {
      id: 'ilepbase',
      title: {
        zh: 'iLepBase · 鳞翅目昆虫基因组与生物多样性综合数据库',
        en: 'iLepBase · Comprehensive Lepidoptera Database & Analysis Platform',
      },
      subtitle: {
        zh: '首都师范大学 · 遗传与进化多样性实验室',
        en: 'Capital Normal University · Lab of Evolutionary & Genetic Diversity',
      },
      organization: {
        zh: '首都师范大学',
        en: 'Capital Normal University',
      },
      role: {
        zh: '前后端核心研发 & 论文共同核心作者（二作在审）',
        en: 'Core Full-Stack Developer & Second Author (MS Under Review)',
      },
      period: '2026.01 – 2026.05',
      categories: ['research', 'bioinformatics', 'opensource'],
      highlightMetric: {
        zh: '数据库已正式上线 · Molecular Ecology Resources 二作在审',
        en: 'Live at ilepbase.com · 2nd Author @ Molecular Ecology Resources',
      },
      bullets: {
        zh: [
          '整合 NCBI、GBIF 等多个公共数据库的鳞翅目昆虫数据，完成前期数据清洗、校正与去重，构建统一标准的数据仓库。',
          '基于 Go Fiber 搭建高性能后端架构并参与前端开发，支持多维检索、分页筛选、详情展示与批量下载；完善 RESTful API 与开源工具链。',
          '集成 BLAST 序列比对、基因组浏览器、蛋白质三维结构可视化及 AI 辅助物种鉴定等在线工具，目前平台已上线运行。',
        ],
        en: [
          'Curated, cleaned, and deduplicated multi-source Lepidoptera records from NCBI and GBIF into a standardized biological data warehouse.',
          'Architected the Go Fiber backend and frontend views supporting multi-faceted search, pagination, bulk downloads, and open-source bioinformatics utilities.',
          'Integrated online BLAST, Genome Browser, 3D protein structure viewer, and AI species identification; deployed and publicly accessible at ilepbase.com.',
        ],
      },
      techTags: ['Go Fiber', 'BLAST', 'Genome Browser', 'Protein 3D View', 'RESTful API', 'Data Warehouse'],
      links: [
        {
          label: { zh: 'iLepBase | 网站', en: 'iLepBase | Website' },
          url: 'https://www.ilepbase.com',
        },
        {
          label: { zh: 'iLepBase | GitHub', en: 'iLepBase | GitHub' },
          url: 'https://github.com/iLepBase',
        },
      ],
    },
    {
      id: 'smartdock',
      title: {
        zh: 'SmartDock · 基于 Nextflow 与 Uni-Dock 的高通量分子对接流程',
        en: 'SmartDock · High-Throughput Molecular Docking & Structure Prediction Pipeline',
      },
      subtitle: {
        zh: '首都师范大学 · 遗传与进化多样性实验室',
        en: 'Capital Normal University · Lab of Evolutionary & Genetic Diversity',
      },
      organization: {
        zh: '首都师范大学',
        en: 'Capital Normal University',
      },
      role: {
        zh: '流程架构与高性能计算核心研发',
        en: 'Lead Workflow & HPC Pipeline Developer',
      },
      period: '2025.09 – 2026.02',
      categories: ['research', 'bioinformatics'],
      highlightMetric: {
        zh: '7,000+ 蛋白结构预测 · 亿级小分子次生代谢物对接',
        en: '7,000+ ColabFold Structures · 100M+ Secondary Metabolite Docking',
      },
      bullets: {
        zh: [
          '搭建基于 Nextflow、ColabFold 与 Uni-Dock 的容器化高通量蛋白结构预测与分子对接 Pipeline，支持 SLURM 集群并行调度。',
          '完成 7,000+ 个蛋白质从肽链到三维结构的预测，通过 GPU 动态分配与 Rust / Python 预处理脚本优化海量小分子 I/O，使集群吞吐量提升约 2 倍。',
          '支撑亿级植物次生代谢物小分子与鳞翅目 P450 酶系蛋白质之间的高通量虚拟筛选任务，结合 ADMET 过滤筛选出数百个潜在互作分子。',
        ],
        en: [
          'Built a containerized Nextflow pipeline uniting ColabFold structure prediction and Uni-Dock GPU docking across SLURM HPC clusters.',
          'Predicted 3D structures for 7,000+ proteins from peptide sequences and doubled cluster docking throughput (~2×) via dynamic GPU scheduling and Rust/Python I/O sharding.',
          'Powered 100M+-scale virtual screening between plant secondary metabolites and Lepidoptera P450 enzymes, identifying hundreds of candidate interacting ligands.',
        ],
      },
      techTags: ['Nextflow', 'Uni-Dock', 'ColabFold', 'SLURM / GPU', 'Rust', 'Python', 'Virtual Screening'],
    },
    {
      id: 'pubmed-mcp-server',
      title: {
        zh: 'PubMed MCP Server · 面向 LLM Agent 的结构化生物医学文献服务',
        en: 'PubMed MCP Server · Structured Biomedical Literature Server for LLM Agents',
      },
      subtitle: {
        zh: '开源科学工具 · 2026 CCF ODTC 开源激励计划 C 类获奖作品',
        en: 'Open-Source Scientific Tool · 2026 CCF ODTC Open Source Incentive Award (Category C)',
      },
      organization: {
        zh: 'GitHub & 魔搭社区 (ModelScope)',
        en: 'GitHub & ModelScope Community',
      },
      role: {
        zh: '独立作者 / 核心开发者（与黄海翔共同申报 CCF ODTC）',
        en: 'Creator & Core Developer (Co-applied CCF ODTC with Haixiang Huang)',
      },
      period: '2025 – 2026',
      categories: ['opensource', 'ai-agent', 'bioinformatics'],
      highlightMetric: {
        zh: '魔搭社区累计调用 400 万+ 次 · CCF ODTC C类获奖作品',
        en: '4,000,000+ Invocations on ModelScope · CCF ODTC Award',
      },
      bullets: {
        zh: [
          '为 LLM Agent 提供结构化 PubMed 文献数据的 MCP 服务器（TypeScript / Node.js），支持文献自动化检索、元数据解析与全文抓取。',
          '设计统一 AgentResponse 响应模型，支持 stdio 与 Streamable HTTP 双传输协议，内置多 API Key 负载均衡与「内存 LRU + 文件持久化」多级缓存。',
          '在魔搭社区（ModelScope）累计调用量已突破 400 万次，获评 2026 中国计算机学会 CCF ODTC 开源激励计划 C 类获奖作品。',
        ],
        en: [
          'Engineered a TypeScript/Node.js Model Context Protocol (MCP) server delivering structured PubMed literature search, metadata parsing, and full-text fetching for LLM Agents.',
          'Designed a unified AgentResponse schema, dual stdio and Streamable HTTP transports, API key pool load-balancing, and two-tier LRU + disk caching.',
          'Surpassed 4,000,000+ invocations on ModelScope and received the 2026 CCF ODTC Open Source Incentive Program Category C Award.',
        ],
      },
      techTags: ['TypeScript', 'Node.js', 'MCP Protocol', 'PubMed E-utilities', 'Streamable HTTP', 'LRU Cache'],
      links: [
        {
          label: { zh: 'PubMed 文献抓取 | ModelScope', en: 'ModelScope MCP Page' },
          url: 'https://modelscope.cn/mcp/servers/liueic/mcp-pubmed-llm-server',
        },
        {
          label: { zh: 'GitHub 开源仓库', en: 'GitHub Profile' },
          url: 'https://github.com/liueic',
        },
      ],
    },
    {
      id: 'pancrepal-ospp',
      title: {
        zh: '小X宝社区 (PancrePal) · 中国科学院软件所开源之夏 (OSPP 2025)',
        en: 'PancrePal (XiaoYiBao) · ISCAS Open Source Promotion Plan (OSPP 2025)',
      },
      subtitle: {
        zh: '中国科学院软件研究所 (ISCAS) · 癌症病人与家属 AI 公益开源社区',
        en: 'Institute of Software, Chinese Academy of Sciences (ISCAS)',
      },
      organization: {
        zh: '中国科学院软件所',
        en: 'ISCAS · OSPP 2025',
      },
      role: {
        zh: '核心开发者',
        en: 'Core Open-Source Developer',
      },
      period: '2025.06 – 2025.10',
      categories: ['opensource', 'ai-agent'],
      highlightMetric: {
        zh: '稳定服务 7,000+ 患者 · 38+ 社区公益项目',
        en: 'Serving 7,000+ Patients · 38+ Community Sub-projects',
      },
      bullets: {
        zh: [
          '作为核心开发者参与小X宝公益开源社区建设，帮助癌症患者与家属构建并发症管理、文献查询 MCP、临床指南检索等一系列智能医疗工具。',
          '主导 AI Gateway 架构设计：针对 FastGPT、Dify、Coze 等异构智能体接口不统一问题，基于 FastAPI 与抽象基类实现标准化网关接口与 Docker 容器化交付。',
          '项目被社区正式采纳并持续维护，平台已稳定服务 7,000+ 名患者及家属。欢迎对医疗 / AI / Agent 感兴趣的同学交流联系！',
        ],
        en: [
          'Core contributor to the PancrePal public-welfare open-source community, building complication management, literature MCP, and clinical guideline tools for cancer patients and families.',
          'Architected the FastAPI-based AI Gateway unifying heterogeneous agent backends (FastGPT, Dify, Coze) with standardized schemas and Docker deployment.',
          'Adopted into core community infrastructure, reliably serving 7,000+ patients over 15 months.',
        ],
      },
      techTags: ['FastAPI', 'AI Gateway', 'Medical RAG', 'MCP', 'Docker', 'OSPP 2025'],
      links: [
        {
          label: { zh: 'PancrePal | GitHub 社区', en: 'PancrePal | GitHub' },
          url: 'https://github.com/PancrePal-xiaoyibao',
        },
      ],
    },
  ] satisfies ExperienceProjectItem[],

  education: [
    {
      institution: {
        zh: '首都师范大学 (Capital Normal University)',
        en: 'Capital Normal University (CNU)',
      },
      department: {
        zh: '生命科学学院',
        en: 'College of Life Sciences',
      },
      degree: {
        zh: '生物科学（非师范）· 理学学士（本科在读）',
        en: 'B.Sc. in Biological Sciences (Non-Teacher Track)',
      },
      period: '2024.09 – Present',
      gpa: '3.78 / 5.0',
      courses: {
        zh: '核心课程：生物化学（90/100）、生物统计学、进化生物学、数学建模（100/100）',
        en: 'Core Coursework: Biochemistry (90/100), Biostatistics, Evolutionary Biology, Mathematical Modeling (100/100)',
      },
      extra: {
        zh: '实验室经历：泛素生物学实验室（2026.09–至今）· 遗传与进化多样性实验室（2025.09–2026.06）',
        en: 'Lab Affiliations: Ubiquitin Biology Lab (2026.09–Present) · Evolutionary & Genetic Diversity Lab (2025.09–2026.06)',
      },
    },
    {
      institution: {
        zh: '首都师范大学 (Capital Normal University)',
        en: 'Capital Normal University (CNU)',
      },
      department: {
        zh: '物理系',
        en: 'Department of Physics',
      },
      degree: {
        zh: '光电信息科学与工程（大一学年，后转入生命科学学院）',
        en: 'Optoelectronic Information Science & Engineering (Freshman Year)',
      },
      period: '2023.09 – 2024.06',
      gpa: '3.99 / 5.0',
      courses: {
        zh: '核心课程：高等数学 A1/A2、线性代数、C 语言程序设计',
        en: 'Core Coursework: Advanced Mathematics A1/A2, Linear Algebra, C Programming',
      },
      extra: {
        zh: '英语水平：CET-4 / CET-6 已通过',
        en: 'English Proficiency: CET-4 & CET-6 Passed',
      },
    },
  ] satisfies EducationItem[],

  skills: [
    {
      category: { zh: '生信计算与分子模拟', en: 'CompBio & Molecular Simulation' },
      items: ['Molecular Dynamics (MD)', 'PPI & CADD', 'Nextflow', 'ColabFold', 'Uni-Dock', 'Transcriptomics / Proteomics'],
    },
    {
      category: { zh: '湿实验与分子生物学', en: 'Wet-Lab & Molecular Biology' },
      items: ['co-IP (免疫共沉淀)', 'Western Blot', 'Cell Culture (细胞培养)', 'LC-MS QC'],
    },
    {
      category: { zh: '编程与高性能系统', en: 'Languages & HPC Systems' },
      items: ['Python', 'Go (Fiber)', 'Rust', 'TypeScript', 'C/C++', 'R', 'SLURM (HPC)', 'Docker'],
    },
    {
      category: { zh: '科学智能与日常爱好', en: 'AI Agents & Hobbies' },
      items: ['MCP Protocol', 'LLM Agents', 'Photography (摄影)', 'Vibe Coding', 'Sci-Fi & Strategy', 'Nature (大自然)'],
    },
  ],

  honors: [
    {
      year: '2025 – 2026',
      title: {
        zh: 'CCF ODTC 开源激励计划 · C 类项目',
        en: 'CCF ODTC Open Source Incentive Program · Category C Award',
      },
      organization: {
        zh: '中国计算机学会开源发展技术委员会 (CCF ODTC)',
        en: 'China Computer Federation Open Source Development Technical Committee',
      },
      detail: {
        zh: '申报项目：PubMed MCP Server（与黄海翔共同申报），魔搭社区累计调用量超 400 万次。',
        en: 'Awarded Project: PubMed MCP Server (co-applied with Haixiang Huang), surpassing 4M+ calls on ModelScope.',
      },
    },
    {
      year: '2023.12',
      title: {
        zh: '校一等奖 · 首都师范大学第六届智能车暨第四届 RoboMaster 机甲大师赛',
        en: 'First Prize · 6th Smart Car & 4th RoboMaster Robotics Competition at CNU',
      },
      organization: {
        zh: '首都师范大学',
        en: 'Capital Normal University',
      },
      detail: {
        zh: '担任队长 & 电控负责人，负责 PID 运动控制算法与多传感器数据融合（C 语言），带领团队完成软硬件联调。',
        en: 'Team Captain & Embedded Control Lead; implemented PID motion control and multi-sensor fusion in C and led full hardware-software integration.',
      },
    },
  ] satisfies HonorItem[],
};
