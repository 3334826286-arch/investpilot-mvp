from __future__ import annotations

from dataclasses import dataclass
from threading import Lock
from time import monotonic
from typing import Any, Callable


@dataclass
class CacheEntry:
    value: Any
    expires_at: float


class TTLCache:
    def __init__(self) -> None:
        self._entries: dict[str, CacheEntry] = {}
        self._lock = Lock()

    def get_or_set(self, key: str, ttl_seconds: int, builder: Callable[[], Any]) -> Any:
        now = monotonic()
        with self._lock:
            current = self._entries.get(key)
            if current and current.expires_at > now:
                return current.value

        value = builder()
        with self._lock:
            self._entries[key] = CacheEntry(value=value, expires_at=now + ttl_seconds)
        return value

    def clear(self) -> None:
        with self._lock:
            self._entries.clear()


ttl_cache = TTLCache()
