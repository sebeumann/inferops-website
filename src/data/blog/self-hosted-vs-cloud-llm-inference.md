---
author: Sebastian Eumann
pubDatetime: 2026-04-09T00:00:00Z
title: "Running LLM Inference: How To Evaluate Self-Hosted vs. Cloud in a Regulated Environment"
featured: true
tags:
  - inference
  - mlops
  - architecture
  - enterprise-ai
description: "A real-world evaluation of self-hosted vs. cloud LLM inference in a regulated enterprise environment — covering total cost of ownership, model selection, regulatory compliance, operational readiness, and the MLOps discipline that makes it work."
---

An enterprise customer came to me with a problem that, over the past year, I have seen in almost identical form at three other organizations. They had half a dozen LLM-powered use cases running in production on Azure OpenAI. The use cases worked. Costs were climbing past €50,000 per month when you counted everything. And three more teams had just submitted requests for inference capacity.

The question that surfaced first was regulatory. Their data protection officer had flagged concerns about sending company data to public inference endpoints. But that was not what actually forced the decision. What forced it was the simultaneous pressure from multiple directions: the finance team asking why AI infrastructure costs had tripled in one quarter, the product teams frustrated by rate limits and model availability constraints, the security team concerned about data flowing to endpoints they could not audit, and the CTO realizing that the organization was building strategic capabilities on top of infrastructure it did not control.

When the question is framed as "should we self-host or keep using APIs," it sounds like a procurement decision. It is not. It is an architecture decision, a capability investment, and an operational commitment, all at once. And the evaluation revealed layers of complexity that most comparison articles never touch.

## The obvious challenge and the ones underneath it

The surface-level problem is straightforward: API inference costs grow linearly with usage, and at some point it becomes cheaper to run the models yourself. Every vendor comparison article on the internet covers this. What most of them miss are the challenges that sit underneath.

**The cost comparison is not what it looks like at first glance.** Comparing API token pricing to GPU-hour pricing is misleading without accounting for engineering labor, operational overhead, compliance costs, and utilization rates. The headline numbers favor self-hosting. The all-in numbers often do not, or at least not by the margin people expect.

**Enterprises do not have a single LLM use case.** They have many, arriving in waves, each with different requirements. A document analysis pipeline needs a large, accurate model. A classification service needs something fast and cheap. A retrieval-augmented generation system needs strong instruction following and long context. An agentic workflow needs reliable tool calling. Serving all of these from a single infrastructure decision is the actual problem, and it is considerably harder than optimizing for one workload.

**Operational readiness is the hidden variable.** The team had strong Kubernetes skills but zero experience with GPU inference infrastructure. That gap does not show up in a cost spreadsheet, but it determined the timeline, the risk profile, and ultimately the shape of the architecture.

**The decision is not binary.** In practice, the most defensible architecture for a regulated European enterprise in 2026 is hybrid: some workloads self-hosted, others on APIs, with the boundary drawn by a combination of data sensitivity, cost dynamics, and model capability requirements.

## Breaking the problem into pieces

The evaluation only became tractable once I decomposed it into five distinct dimensions, each with its own data requirements and decision criteria.

| Dimension | Core question | What drives the answer |
|---|---|---|
| Total cost of ownership | At our token volume, which option costs less over 18 months? | Token volume, GPU utilization rate, engineering labor |
| Performance | Can self-hosted inference match the latency and throughput we need? | Workload mix (real-time vs. batch), concurrency, model size |
| Regulatory compliance | Which deployment model satisfies our data protection obligations? | Data classification, GDPR transfer mechanisms, AI Act obligations |
| Operational readiness | Can the team actually run what we are proposing to build? | Existing skills, hiring timeline, knowledge transfer needs |
| Vendor and platform risk | What happens when the landscape changes? | Lock-in exposure, pricing volatility, model availability |

The structure mattered as much as the analysis. Without it, whichever stakeholder spoke loudest would have driven the decision without the other dimensions getting a proper hearing.

## The cost picture: what the numbers actually show

This is where the evaluation delivered its sharpest insights. I will walk through the math because the specifics are what matter, not the general principle that "self-hosting can be cheaper at scale."

### What API inference actually costs

The customer's monthly Azure OpenAI token spend was approximately €18,500 across six use cases. But the invoice total was not the true cost. When I added the engineering time spent managing API quotas, handling retry logic for rate-limiting events, maintaining the provider abstraction layer, and the Azure support plan required for production SLA coverage, the real monthly cost was closer to €50,000.

The token volume was roughly 85 million input tokens and 22 million output tokens per month. Current API pricing for the models in use:

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Source |
|---|---|---|---|
| GPT-5.4 | $2.50 | $15.00 | [OpenAI pricing](https://developers.openai.com/api/docs/pricing) |
| GPT-5.4-mini | $0.30 | $1.50 | [OpenAI pricing](https://developers.openai.com/api/docs/pricing) |
| Claude Sonnet 4.6 | $3.00 | $15.00 | [Anthropic pricing](https://www.anthropic.com/pricing) |
| DeepSeek V3.2 | $0.14 | $0.28 | [DeepSeek pricing](https://www.tldl.io/resources/openai-api-pricing) |
| Qwen 3.5 27B (self-hosted) | ~$0.18 | ~$0.55 | Derived from GPU cost at 60% utilization |

The last row is the important one. At 60% GPU utilization, self-hosted Qwen 3.5 27B on an H100 reaches a per-token cost that competes with DeepSeek's API pricing, while giving you complete control over the data plane. Against GPT-5.4 or Claude Sonnet 4.6 output pricing at $15 per million tokens, the self-hosted economics are even more compelling. That is the economic core of the self-hosting case.

### What self-hosted inference actually costs

GPU compute is only one line item. The full cost stack for self-hosted inference:

| Cost category | Monthly estimate | Notes |
|---|---|---|
| GPU compute (2x H100 on Azure, reserved 1-year) | €7,500 - €9,000 | [NC40ads H100 v5 at ~$6.98/hr on-demand](https://instances.vantage.sh/azure/vm/nc40adsh100-v5), ~30-40% reserved discount |
| GPU compute (2x H100 on Scaleway) | €3,600 - €4,000 | [€2.52/hr per GPU](https://verda.com/blog/cloud-gpu-pricing-comparison), EU-only infrastructure |
| Engineering: initial setup (amortized) | €2,000 - €3,000 | 6-8 engineer-weeks, spread over 18 months |
| Engineering: ongoing operations | €2,500 - €4,000 | ~20-30% of one platform engineer |
| Monitoring and observability | €500 - €800 | Prometheus, Grafana, GPU-specific metrics |
| Security and compliance overhead | €1,200 - €2,000 | Audit documentation, access control, hardening |

The [Introl blog's analysis of inference unit economics](https://introl.com/blog/inference-unit-economics-true-cost-per-million-tokens-guide) estimates operational overhead adds $2 to $7 per hour on top of raw GPU cost. Our numbers landed squarely in that range.

### The break-even point: what drives the number

Published research consistently places the self-hosting break-even point around 50 million tokens per month against premium APIs when you fully account for engineering overhead. That number deserves unpacking, because it is one of the most consequential thresholds in this entire decision.

The 50 million figure comes from the intersection of three cost curves. The first is the **fixed cost floor** of self-hosting: even at zero token throughput, you are paying for GPU compute, engineering time, and infrastructure maintenance. For a minimal production setup (two H100 GPUs on a European cloud provider, one part-time engineer, monitoring, compliance), that floor sits at roughly €8,000 to €12,000 per month. The second curve is the **marginal cost per token** once infrastructure is running, which is near zero: the GPUs are already paid for, so additional tokens cost only the electricity and wear. The third is the **API cost curve**, which is strictly linear: every token costs the same whether it is your first or your hundred-millionth.

The break-even point is where the declining average cost of self-hosting (fixed costs spread over more tokens) crosses below the flat per-token API price. At 20 million tokens per month, the self-hosted average cost per token is still above frontier API pricing because the fixed costs dominate. At 50 million, the curves cross against GPT-5.4 and Claude Sonnet 4.6 output rates. At 100 million, self-hosting is 30 to 40% cheaper. At 500 million, it is dramatically cheaper. Note that against ultra-cheap APIs like DeepSeek V3.2 at $0.14 per million input tokens, the break-even shifts much higher, past 200 million tokens per month, because you are competing against a provider that has already optimized their own GPU economics at massive scale.

A [Carnegie Mellon study examining 54 deployment scenarios](https://arxiv.org/html/2509.18101v1) found small-scale deployments can break even within 0.3 to 3 months, while medium-scale deployments take 2.3 to 34 months depending on model size and utilization. A [Dell Technologies study](https://www.delltechnologies.com/asset/en-in/solutions/business-solutions/industry-market/esg-inferencing-on-premises-with-dell-technologies-analyst-paper.pdf) found on-premise infrastructure reduced per-user costs by 2.9 to 4.1 times compared to frontier API pricing over four years.

But the variable that swings the comparison most dramatically is GPU utilization.

| Average GPU utilization | Self-hosted vs. API (18-month total cost of ownership) | Verdict |
|---|---|---|
| Below 25% | Self-hosted 20-40% more expensive | API wins clearly |
| 40-50% | Roughly equivalent | Decision driven by non-cost factors |
| 60-70% | Self-hosted 25-35% cheaper | Self-hosting favored |
| Above 80% | Self-hosted 40-50% cheaper | Strong self-hosting case |

This is where the multi-application reality matters. A single use case might not generate enough volume. But six use cases, consolidated onto shared GPU infrastructure with proper scheduling and queuing, might push utilization past 60% and cross the break-even decisively. The aggregation effect across multiple workloads is what makes enterprise self-hosting economics work.

## Choosing models for real enterprise workloads

This engagement needed models for five distinct workload types: document analysis, classification, retrieval-augmented generation, summarization, and an emerging agentic workflow. No single model is optimal for all of these. The open-source landscape in 2026 is deep enough to match models to workloads.

| Workload | Recommended model | GPU requirement | Why this model |
|---|---|---|---|
| Document analysis (complex reasoning) | Qwen 3.5 27B dense | 1x H100 80GB | [A-tier on current benchmarks](https://onyx.app/llm-leaderboard), 256K context, Apache 2.0 license, strong structured analysis |
| Classification and routing | Mistral Small 3.1 (24B) | 1x A100 or L40S | [Fast inference, strong instruction following](https://kairntech.com/blog/articles/top-open-source-llm-models-in-2026/), Apache 2.0, runs on 16GB with quantization |
| Retrieval-augmented generation | Qwen 3.5 122B-A10B (Mixture of Experts) | 1x H100 80GB | [256K native context](https://computingforgeeks.com/open-source-llm-comparison/), only 10B active parameters per token, excellent grounding fidelity |
| Summarization | Gemma 4 26B or Phi-4 14B | 1x L40S or A100 | Cost-efficient for bulk processing; [Gemma 4 delivers strong quality at 14GB](https://www.bentoml.com/blog/navigating-the-world-of-open-source-large-language-models) |
| Agentic workflows (tool calling) | Qwen 3.5 27B or GLM-4.7 Flash (30B) | 1x H100 80GB | [Native tool-calling, toggleable chain-of-thought](https://computingforgeeks.com/open-source-llm-comparison/), strong agentic benchmark scores |

A note on the Llama series: Meta's Llama 4 family (Scout at 109B, Maverick at 400B) uses Mixture-of-Experts but [lands in the C tier on current composite benchmarks](https://onyx.app/llm-leaderboard), behind Qwen 3.5, DeepSeek V3.2, and Mistral Large. Llama 3.3 70B remains a solid workhorse that roughly matches GPT-4 vintage quality, but it is no longer the default recommendation for new deployments when Qwen 3.5 27B delivers stronger performance on a comparable GPU footprint with a more permissive license.

The Mixture-of-Experts architectures deserve particular attention for enterprise inference economics. Qwen 3.5 and Mistral's newer models activate only a fraction of their total parameters per token. The Qwen 3.5 122B-A10B model, for example, has 122 billion total parameters but activates only 10 billion per forward pass. The practical result is frontier-class capability at mid-tier GPU cost. For retrieval-augmented generation specifically, where long context windows and grounding fidelity matter more than raw reasoning, these models are remarkably cost-effective.

The model diversity also affects infrastructure planning. Running five different models efficiently requires the kind of scheduling, routing, and resource management that a single vLLM deployment does not provide out of the box.

## The Microsoft Copilot question

In any enterprise that runs Microsoft 365, the question "why not just use Copilot?" will come up. It came up here. It deserves a direct answer.

Microsoft 365 Copilot is priced at [$30 per user per month for the enterprise plan](https://www.microsoft.com/en-us/microsoft-365-copilot/pricing/enterprise), on top of the existing Microsoft 365 subscription. For a 500-person organization, that is €180,000 per year in licensing alone. The business plan starts at [$18 per user per month](https://copilot-experts.com/microsoft-copilot-pricing-guide/) with a promotional rate through June 2026.

Copilot excels at what it was designed for: enhancing productivity inside the Microsoft 365 application suite. Summarizing meetings in Teams, drafting emails in Outlook, generating slides in PowerPoint, analyzing data in Excel. It is grounded in the organization's Microsoft Graph data (emails, files, calendar, chat) and operates within the Microsoft 365 service boundary, which simplifies the compliance story considerably.

Where Copilot does not help is with the use cases that actually drove this customer's inference demand. Document analysis pipelines that process thousands of files overnight. Classification services that route incoming requests. Retrieval-augmented generation against specialized knowledge bases. Agentic workflows that interact with internal APIs and databases. These are custom applications that need to call inference endpoints from their own code, integrate with domain-specific data sources, and run at volumes that per-user licensing does not accommodate.

The two approaches are not competing. Copilot serves the productivity layer: making individual knowledge workers more effective inside familiar tools. Self-hosted or API-based inference serves the application layer: powering custom software that automates business processes at scale. Most enterprises will eventually need both. The mistake is assuming that buying Copilot licenses solves the infrastructure question, or that building inference infrastructure removes the need for Copilot. They address fundamentally different problems.

## The engineering reality check

Here is where the evaluation turned uncomfortable. Self-hosting sounds clean in a cost model. The operational reality is considerably rougher, and I have seen it stall projects that were otherwise well-conceived.

Beyond Kubernetes and container orchestration, self-hosted LLM inference requires a stack of specialized capabilities that most enterprise platform teams do not have today.

**GPU profiling and memory management.** A Llama 70B model in FP8 fits on a single H100 with roughly 35 gigabytes of weight data. But inference memory usage is not static. The KV cache grows with sequence length and batch size. Under high concurrency, you can exhaust the remaining 45 gigabytes of GPU memory without any warning unless you have configured memory limits, monitored cache pressure, and tuned the maximum number of concurrent sequences. Getting this wrong means either out-of-memory crashes in production or artificially low throughput because you set limits too conservatively.

**Model lifecycle management.** Open-source models update frequently. Llama 3.1 gave way to Llama 3.3, then Llama 4. Qwen 3 was followed by Qwen 3.5 within months. Each update can change memory requirements, batching behavior, and quantization compatibility. Swapping a model is not a configuration change. It is an engineering task that requires benchmarking, validation against your specific use cases, and careful rollout.

**Multi-model serving and request routing.** When you run five models for five workloads, you need an inference gateway that routes requests to the right model, manages queuing, handles failover, and exposes a unified API that application teams can consume without knowing which model sits behind it. This is not something vLLM provides out of the box. It is a layer you build, or assemble from components like KServe, NVIDIA Triton, or a custom gateway.

**GPU scheduling across workloads.** Batch jobs (running at 3 AM at full GPU utilization) and real-time serving (variable load during business hours) compete for the same hardware. Without proper scheduling, either the batch jobs starve the real-time workloads or the GPUs sit idle outside business hours. NVIDIA Multi-Instance GPU (MIG) partitioning, time-slicing, and priority-based scheduling through Kubernetes are the tools, but configuring them correctly for mixed workloads is non-trivial.

**Observability that goes beyond uptime.** Standard application monitoring (is it up? what is the error rate?) is insufficient. You need token-level throughput metrics, per-model latency percentiles, GPU memory utilization trends, KV cache hit rates, and queue depth monitoring. DCGM Exporter provides the GPU-level metrics, but correlating them with application-level behavior requires custom dashboards and alerting rules.

None of this is impossible. But it is a significant investment of engineering skill and time that many organizations underestimate. A team that has never operated GPU infrastructure will spend three to six months building competence, and during that period, every incident is a learning experience that costs time and potentially availability. This is a real project risk that belongs in the business case alongside the cost projections.

## The multi-application challenge

In an enterprise, LLM inference is not a standalone capability. It is something that dozens of applications and teams want to consume, each with their own requirements.

The product team wants to embed summarization into an existing case management system that runs on a PostgreSQL database. The customer service team wants a retrieval-augmented generation chatbot that queries a Solr index. The legal team wants document review against a SharePoint library. The data engineering team wants classification running inside an Apache Airflow pipeline. None of these teams want to think about GPU scheduling. They want an API endpoint that returns answers.

This is the pattern I see repeatedly: the demand for LLM inference is distributed across the organization, but the infrastructure to serve it must be centralized. Individual teams cannot each run their own GPU cluster. The economics only work when workloads are consolidated, utilization is high, and the platform serves many consumers.

What that requires, practically, is an internal inference platform. An API gateway that application teams can call, with model routing, authentication, rate limiting, and usage metering. A model registry that tracks which versions are deployed. A deployment pipeline that can roll out model updates without downtime. Monitoring that catches degradation before users notice.

## The regulatory reality

The data protection officer's position was binary: no regulated or private data on public infrastructure. A detailed analysis revealed a more layered picture.

**The EU-US Data Privacy Framework holds, but is structurally fragile.** The EU General Court [dismissed a challenge to the framework in September 2025](https://www.jonesday.com/en/insights/2025/09/eu-general-court-upholds-euus-data-privacy-framework), confirming its legal validity. But it rests on [Executive Order 14086](https://www.data-privacy-framework.com/), which any US president can modify without Congressional action. Legal experts recommend supplementing it with Standard Contractual Clauses as a [fallback](https://iapp.org/news/a/schrems-addresses-emerging-questions-around-eu-us-data-privacy-framework).

**Azure OpenAI in EU regions satisfies many, but not all, requirements.** Azure holds [BSI C5 attestation](https://www.roedl.com/en/insights/bsi-c5-establishing-itself-as-a-cross-industry-standard-for-cloud-security/) for German regions. [OpenAI offers EU data residency](https://openai.com/index/introducing-data-residency-in-europe/) for API customers. For many enterprise use cases, this is sufficient. But the [CLOUD Act](https://massivegrid.com/blog/us-cloud-act-explained-europe/) means Microsoft cannot guarantee sovereignty against a legally valid US order, and for some data categories, that remaining exposure is unacceptable.

**The EU AI Act adds a compliance asymmetry.** [General-purpose AI model obligations](https://digital-strategy.ec.europa.eu/en/policies/guidelines-gpai-providers) in effect since August 2025 require model providers to maintain technical documentation. When consuming an API, the provider bears this burden. When self-hosting and substantially modifying an open-source model, the deploying organization could [inherit provider obligations](https://artificialintelligenceact.eu/providers-of-general-purpose-ai-models-what-we-know-about-who-will-qualify/). The [full high-risk AI system provisions take effect August 2, 2026](https://www.orrick.com/en/Insights/2025/11/The-EU-AI-Act-6-Steps-to-Take-Before-2-August-2026).

The regulatory analysis did not produce a single answer. It produced a boundary. Some use cases could remain on API infrastructure with proper safeguards. Others could not.

## Implementation: where MLOps becomes the answer

By this point in the evaluation, the picture was clear, and honestly, daunting. Multiple models for multiple workloads. GPU infrastructure that needs specialized operations. Dozens of consuming applications. Regulatory boundaries that split the architecture. A team that had never done any of this before.

This is the point where the engagement could have stalled. The complexity was real and the risks were quantifiable. What made it tractable was recognizing that the problem had a name: MLOps. Not MLOps as a buzzword or a job title, but MLOps as an engineering discipline. The set of practices, tools, and architectural patterns that turn "we can run a model in a notebook" into "we can serve inference to the entire organization, reliably, at scale, with governance."

Everything that looked overwhelming in isolation became manageable once treated as components of an MLOps platform.

The serving framework decision went to vLLM. March 2026 [benchmarks from Spheron](https://www.spheron.network/blog/vllm-vs-tensorrt-llm-vs-sglang-benchmarks/) on Llama 3.3 70B FP8 on a single H100:

| Framework | Throughput (100 concurrent) | Time-to-first-token (P50) | Cold start |
|---|---|---|---|
| TensorRT-LLM v1.2.0 | 2,780 tokens/second | 105 milliseconds | ~28 minutes |
| SGLang v0.5.9 | 2,460 tokens/second | 112 milliseconds | ~90 seconds |
| vLLM v0.18.0 | 2,400 tokens/second | 120 milliseconds | ~62 seconds |

TensorRT-LLM is faster, but 62 seconds versus 28 minutes for cold start means vLLM lets the team iterate without losing half a day to engine compilation. For a team building operational muscle, that matters more than 16% throughput.

The deployment runs on Azure Kubernetes Service with GPU node pools, using standard Kubernetes manifests rather than Azure Machine Learning managed endpoints. Azure Machine Learning endpoints provide turnkey deployment but create lock-in through proprietary SDK, workspace APIs, and a [custom inference router that reserves 20% of compute for upgrades](https://docs.azure.cn/en-us/machine-learning/concept-endpoints-online?view=azureml-api-2).

The portable stack:

| Component | Choice | Why this and not the alternative |
|---|---|---|
| Compute | AKS with [NC40ads H100 v5 GPU nodes](https://instances.vantage.sh/azure/vm/nc40adsh100-v5) | Standard Kubernetes; same manifests work on any cloud or on-premise |
| GPU management | [NVIDIA GPU Operator](https://learn.microsoft.com/en-us/azure/aks/nvidia-gpu-operator) | Handles driver lifecycle, device plugin, metrics export |
| Serving | vLLM with OpenAI-compatible API endpoint | Application code unchanged regardless of backend |
| Autoscaling | KEDA with Prometheus metrics | GPU-aware scaling; CPU utilization is meaningless for inference |
| Monitoring | Prometheus + Grafana + DCGM Exporter | Cloud-agnostic; not locked to Azure Monitor |
| Infrastructure as Code | Terraform with provider-specific modules | Not ARM templates; portable across clouds |
| Model registry | MLflow | Version tracking, deployment metadata, rollback capability |
| Request routing | Custom gateway or KServe | Routes to the right model per workload, unified API for consumers |

[Azure Arc-enabled Kubernetes](https://blog.aks.azure.com/2026/04/07/ai-inference-on-aks-arc-part-1) extends the same management plane to on-premise clusters, keeping the data plane entirely local for workloads where data must not leave the premises.

### What MLOps teams actually monitor

The monitoring layer is where the difference between "running some GPU containers" and "operating an inference platform" becomes concrete. Standard application monitoring (is the pod healthy? what is the HTTP error rate?) is insufficient for LLM inference. The failure modes are different, the degradation patterns are subtler, and the metrics that matter are specific to this workload.

These are the metrics that the MLOps team watches in production, organized by what they tell you:

**Inference performance (are consumers getting what they need?):**

| Metric | Source | Alert threshold (our config) | Why it matters |
|---|---|---|---|
| Time-to-first-token (P50, P95, P99) | vLLM `/metrics` endpoint | P95 > 500ms | Users perceive delay before the first token; this is the latency that drives UX complaints |
| Inter-token latency (P95) | vLLM `/metrics` endpoint | P95 > 80ms | Streaming responsiveness; high values make chat-style interfaces feel sluggish |
| End-to-end request latency (P99) | Gateway / Prometheus | P99 > 10s for standard requests | Catches tail latencies from long-context queries or queue backup |
| Tokens per second (throughput) | vLLM `vllm:generation_tokens_total` | Sustained drop > 20% from baseline | Capacity degradation; often first sign of memory pressure or scheduling issues |
| Request queue depth | vLLM `vllm:num_requests_waiting` | > 50 sustained for 2 minutes | Autoscaling trigger; if this stays high, you need more replicas or GPUs |

**GPU resource health (is the hardware doing what you think it is doing?):**

| Metric | Source | Alert threshold | Why it matters |
|---|---|---|---|
| GPU memory utilization (HBM) | DCGM Exporter `DCGM_FI_DEV_FB_USED` | > 92% sustained | KV cache is growing past safe limits; risk of out-of-memory crashes |
| GPU Streaming Multiprocessor utilization | DCGM Exporter `DCGM_FI_DEV_GPU_UTIL` | < 15% sustained during business hours | GPUs are idle; either traffic routing is misconfigured or autoscaler is overprovisioning |
| GPU temperature | DCGM Exporter `DCGM_FI_DEV_GPU_TEMP` | > 83°C sustained | Thermal throttling imminent; performance will degrade without intervention |
| GPU memory errors (ECC) | DCGM Exporter `DCGM_FI_DEV_ECC_DBE_VOL_TOTAL` | Any double-bit error | Hardware failure in progress; schedule migration and replacement |
| NVLink throughput (multi-GPU) | DCGM Exporter | Drop > 40% from baseline | Tensor parallel communication degrading; check link health |

**Model and application health (is the output still good?):**

| Metric | Source | What it tells you |
|---|---|---|
| Output token distribution shift | Custom middleware | Sudden changes in average output length signal model misbehavior or prompt injection |
| Error rate by type (OOM, timeout, invalid input) | Gateway logs | Distinguishes infrastructure problems (OOM) from application problems (bad prompts) |
| Per-model, per-consumer token accounting | Gateway middleware | Cost attribution and capacity planning; shows which teams are consuming what |
| KV cache hit rate | vLLM metrics | Effectiveness of prompt caching; low rates mean you are paying full compute on repeated contexts |

The non-obvious lesson: the most operationally dangerous metric is not any single alert, but the combination of rising queue depth with stable GPU utilization. That pattern means the serving framework is bottlenecked on something other than raw compute: typically memory bandwidth, KV cache eviction overhead, or a batching configuration that is too conservative. It looks like a scaling problem but autoscaling more GPUs will not fix it. It requires tuning, which requires an engineer who understands inference-specific performance characteristics.

### The MLOps discipline that ties it together

The monitoring layer is one component. The full MLOps practice connects it to model versioning so you can roll back when an update degrades quality. Deployment pipelines so model updates do not require SSH access and manual intervention. A model registry that answers "which model is serving this endpoint right now, what version, deployed by whom, and when." Canary deployments that route 5% of traffic to a new model version and compare output quality metrics against the baseline before promoting. Governance workflows that satisfy auditors without blocking engineers.

Without MLOps, you have a collection of GPU containers. With it, you have an inference platform.

## Outcome and what I learned

The hybrid architecture has been running for twelve months. Two use cases on self-hosted Qwen 3.5 and Mistral Small via vLLM, four on Azure OpenAI. No major incidents on the self-hosted side. The 18-month total cost of ownership came in roughly €65,000 lower than the all-API projection. The savings compound as additional use cases migrate to the shared GPU infrastructure.

Three things I would do differently.

**Budget more engineering time in the first six months.** The initial estimate of 20% of one engineer's time for ongoing operations was optimistic by about 40%. Model updates turned into multi-day efforts because new models have different memory characteristics and need batching parameters re-tuned. The team has since automated much of this through their MLOps pipeline, but the learning cost was real.

**Start with one use case, not two.** Migrating two workloads simultaneously doubled the surface area for problems during a period when the team was still building operational muscle. A single use case as a learning vehicle would have delivered the same lessons with less risk.

**Price in regulatory change.** New [AI Act guidance](https://iapp.org/news/a/general-purpose-ai-models-the-european-commission-s-guidelines-on-the-scope-of-obligations) clarified ambiguities that had influenced the original boundary between self-hosted and API use cases. One workload ended up moving from API to self-hosted under updated internal guidelines. Build contingency into the architecture for the boundary to shift, because it will.

The most durable outcome was not the specific architecture or the cost savings. It was that the organization now operates an internal inference platform with MLOps practices that can absorb the next wave of use cases without starting from scratch. They know what self-hosted inference actually costs. Not the spreadsheet version, but the lived version. When the landscape changes again, and [inference costs are declining roughly 10x per year for equivalent quality](https://a16z.com/llmflation-llm-inference-cost/), that operational foundation is what turns the next decision from a gamble into an informed choice.

The models will keep changing. The APIs will keep getting cheaper. The regulatory landscape will keep shifting. The thing that compounds is not the infrastructure. It is the operational discipline to manage it.
