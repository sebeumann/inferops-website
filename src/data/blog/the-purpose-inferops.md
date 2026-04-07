---
title: "Hello World — Welcome to InferOps"
author: Sebastian
pubDatetime: 2026-04-01T10:00:00Z
slug: infrastructure
featured: true
draft: false
tags:
  - ai-infrastructure
  - mlops
description: "Introducing inferops.dev — a blog about MLOps, LLMOps, and the infrastructure that powers production AI systems."
---

Welcome to InferOps.

I've been working in enterprise AI for several years now, and one thing still strikes me: the distance between ambition and reality is enormous. Every company wants AI. Most of them have a strategy deck, a handful of proof of concepts, and at least one team that got something promising running in a notebook. And then it stops.

Not because the models don't work. Not because the use case isn't there. It stops because nobody planned for what happens after the demo. How do you serve that model at scale? How do you version it, monitor it, roll it back at 2am when something drifts? How do you get it through security review, connect it to your actual data, and run it on infrastructure your ops team can maintain?

This is the chasm. Not between AI and no AI, but between "it works on my machine" and "it runs in production and we trust it." And in my experience, the single biggest reason enterprises can't cross it is that they don't know how to handle MLOps as actual engineering discipline.

I'm starting this blog to help bridge that gap. Not with theory, not with vendor pitches, but with the practical stuff: architecture decisions, infrastructure patterns, tooling comparisons, and the hard-won lessons from building systems that real users actually depend on every day.

## Who this is for

If you're an ML engineer wondering why your deployment pipeline feels held together with duct tape, this is for you.

If you're a platform engineer who just got told "we need to support GPU workloads by Q3," this is for you.

If you're a technical lead or engineering manager trying to figure out whether to build or buy, and what questions to even ask, this is definitely for you.

## What to expect

The posts here will cover the full surface area of getting ML and LLM workloads to production and keeping them there:

Model serving and inference optimization. Not just which framework to pick, but how to think about latency, throughput, and cost when your traffic patterns don't look anything like the benchmarks.
ML pipeline orchestration on Kubernetes. Because that's where most of this ends up running, and the gap between "kubectl apply" and a production-grade ML platform is wider than most people expect.
LLM deployment patterns. RAG architectures, agentic workflows, fine-tuning pipelines, prompt management. What actually works at enterprise scale versus what looks good in a blog post with three users.

GPU scheduling and cost optimization. How to avoid burning money on idle accelerators while still keeping inference latency where it needs to be.

Observability and monitoring for ML systems. Model drift, pipeline health, inference quality. The stuff that decides whether your system degrades silently or tells you before your users notice.
CI/CD for ML workloads. Because your model is not a microservice, and treating it like one is how you end up redeploying from a notebook at midnight.

Infrastructure as code, feature stores, data pipelines, and the DevOps glue that nobody talks about at AI conferences but everyone needs on Monday morning.

## Why a blog on MLOps?

To be honest, I haven't found a resource that is purely dedicated to MLOps or LLMOps. And my intention is to change it and make the look onto the field of MLOps- / LLMOps- Engineering more practical.

Another reason: The gap between training a model and running it reliably in production is where most ML projects die, and that gap is an engineering problem. It has engineering solutions. They're just not always obvious.

This blog is about those solutions. Practical, opinionated, and grounded in what actually ships.

Stay tuned. First real post is coming soon.
