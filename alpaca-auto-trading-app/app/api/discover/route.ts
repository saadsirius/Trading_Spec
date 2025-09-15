import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type');
    const sector = searchParams.get('sector');
    const region = searchParams.get('region');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minChange = searchParams.get('minChange');
    const maxChange = searchParams.get('maxChange');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {
      isActive: true,
      isTradeable: true,
    };

    // Search filter
    if (search) {
      where.OR = [
        { symbol: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    // Type filter
    if (type && type !== 'ALL') {
      where.type = type;
    }

    // Sector filter
    if (sector && sector !== 'ALL') {
      where.sector = sector;
    }

    // Region filter
    if (region && region !== 'ALL') {
      where.region = region;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Change range filter
    if (minChange || maxChange) {
      where.changePercent = {};
      if (minChange) where.changePercent.gte = parseFloat(minChange);
      if (maxChange) where.changePercent.lte = parseFloat(maxChange);
    }

    // Fetch instruments with price data
    const instruments = await prisma.instrument.findMany({
      where,
      include: {
        priceBars: {
          where: {
            timeframe: '1D',
          },
          orderBy: {
            timestamp: 'desc',
          },
          take: 30, // Last 30 days for sparkline
        },
      },
      orderBy: [
        { changePercent: 'desc' },
        { volume: 'desc' },
      ],
      take: limit,
      skip: offset,
    });

    // Transform data for frontend
    const transformedInstruments = instruments.map(instrument => ({
      id: instrument.id,
      symbol: instrument.symbol,
      name: instrument.name,
      type: instrument.type,
      sector: instrument.sector,
      region: instrument.region,
      price: instrument.price,
      changePercent: instrument.changePercent,
      volume: instrument.volume,
      avgVolume: instrument.avgVolume,
      marketCap: instrument.marketCap,
      volatility: instrument.volatility,
      liquidityScore: instrument.liquidityScore,
      tags: instrument.tags,
      sparkline: instrument.priceBars
        .reverse() // Reverse to get chronological order
        .map(bar => bar.close),
      // Additional metadata
      expenseRatio: instrument.expenseRatio,
      dividendYield: instrument.dividendYield,
      peRatio: instrument.peRatio,
      beta: instrument.beta,
      currency: instrument.currency,
    }));

    return NextResponse.json({
      instruments: transformedInstruments,
      total: transformedInstruments.length,
      hasMore: transformedInstruments.length === limit,
    });

  } catch (error) {
    console.error('Error fetching instruments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch instruments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, name, type, sector, region, price, description } = body;

    // Validate required fields
    if (!symbol || !name || !type || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if instrument already exists
    const existingInstrument = await prisma.instrument.findUnique({
      where: { symbol },
    });

    if (existingInstrument) {
      return NextResponse.json(
        { error: 'Instrument already exists' },
        { status: 409 }
      );
    }

    // Create new instrument
    const instrument = await prisma.instrument.create({
      data: {
        symbol,
        name,
        type,
        sector,
        region,
        price,
        description,
        currency: 'USD',
        isActive: true,
        isTradeable: true,
        tags: [],
      },
    });

    return NextResponse.json(instrument, { status: 201 });

  } catch (error) {
    console.error('Error creating instrument:', error);
    return NextResponse.json(
      { error: 'Failed to create instrument' },
      { status: 500 }
    );
  }
}
