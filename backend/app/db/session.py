import logging

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

engine = create_async_engine(
    settings.database_url,
    echo=False,
)

SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def _migrate(conn) -> None:
    """Add new columns to existing tables without dropping data.

    SQLite does not support ALTER TABLE … ADD COLUMN IF NOT EXISTS, so we
    catch the OperationalError that occurs when the column already exists.
    """
    migrations = [
        "ALTER TABLE call_records ADD COLUMN language_code VARCHAR(16) DEFAULT 'en-US'",
        "ALTER TABLE call_records ADD COLUMN twilio_call_sid VARCHAR(64)",
        "ALTER TABLE call_records ADD COLUMN conversation_history TEXT",
    ]
    for stmt in migrations:
        try:
            await conn.execute(text(stmt))
        except Exception:
            pass  # column already exists — safe to ignore


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await _migrate(conn)
