import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: `Resumí esto: ${JSON.stringify(body)}`
    });

    return NextResponse.json({
      ok: true,
      result: response.output_text
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Error' },
      { status: 500 }
    );
  }
}
