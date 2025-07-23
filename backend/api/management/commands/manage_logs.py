"""
Django management command to manage log files.

Usage:
    python manage.py manage_logs --cleanup-old
    python manage.py manage_logs --rotate-now
    python manage.py manage_logs --show-stats
"""

import os
import glob
import shutil
from datetime import datetime, timedelta
from pathlib import Path
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings


class Command(BaseCommand):
    help = 'Manage log files including cleanup and rotation'

    def add_arguments(self, parser):
        parser.add_argument(
            '--cleanup-old',
            action='store_true',
            help='Clean up old log files based on retention settings',
        )
        parser.add_argument(
            '--rotate-now',
            action='store_true',
            help='Force rotation of current log files',
        )
        parser.add_argument(
            '--show-stats',
            action='store_true',
            help='Show statistics about log files',
        )
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Number of days to keep logs (default: 30)',
        )

    def handle(self, *args, **options):
        logs_dir = Path(settings.LOGS_DIR)
        
        if not logs_dir.exists():
            self.stdout.write(
                self.style.WARNING(f'Logs directory {logs_dir} does not exist. Creating...')
            )
            logs_dir.mkdir(parents=True, exist_ok=True)

        if options['show_stats']:
            self.show_log_stats(logs_dir)
        
        if options['cleanup_old']:
            self.cleanup_old_logs(logs_dir, options['days'])
        
        if options['rotate_now']:
            self.rotate_logs_now(logs_dir)

    def show_log_stats(self, logs_dir: Path):
        """Show statistics about log files."""
        self.stdout.write(self.style.SUCCESS('=== Log File Statistics ==='))
        
        log_files = list(logs_dir.glob('*.log*'))
        
        if not log_files:
            self.stdout.write('No log files found.')
            return

        total_size = 0
        file_stats = {}

        for log_file in log_files:
            size = log_file.stat().st_size
            total_size += size
            file_stats[log_file.name] = {
                'size': size,
                'modified': datetime.fromtimestamp(log_file.stat().st_mtime)
            }

        # Sort by size (largest first)
        sorted_files = sorted(file_stats.items(), key=lambda x: x[1]['size'], reverse=True)

        for filename, stats in sorted_files:
            size_mb = stats['size'] / (1024 * 1024)
            modified_str = stats['modified'].strftime('%Y-%m-%d %H:%M:%S')
            self.stdout.write(
                f"{filename:<25} {size_mb:>8.2f} MB  {modified_str}"
            )

        total_mb = total_size / (1024 * 1024)
        self.stdout.write(f"\nTotal: {len(log_files)} files, {total_mb:.2f} MB")

    def cleanup_old_logs(self, logs_dir: Path, days: int):
        """Clean up log files older than specified days."""
        self.stdout.write(f'Cleaning up log files older than {days} days...')
        
        cutoff_date = datetime.now() - timedelta(days=days)
        deleted_count = 0
        deleted_size = 0

        # Find all log files (including rotated ones)
        log_patterns = ['*.log', '*.log.*']
        
        for pattern in log_patterns:
            for log_file in logs_dir.glob(pattern):
                try:
                    file_mtime = datetime.fromtimestamp(log_file.stat().st_mtime)
                    if file_mtime < cutoff_date:
                        file_size = log_file.stat().st_size
                        log_file.unlink()
                        deleted_count += 1
                        deleted_size += file_size
                        self.stdout.write(f'Deleted: {log_file.name}')
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'Error deleting {log_file.name}: {e}')
                    )

        if deleted_count > 0:
            deleted_mb = deleted_size / (1024 * 1024)
            self.stdout.write(
                self.style.SUCCESS(
                    f'Cleanup completed: {deleted_count} files deleted, '
                    f'{deleted_mb:.2f} MB freed'
                )
            )
        else:
            self.stdout.write('No old log files found to delete.')

    def rotate_logs_now(self, logs_dir: Path):
        """Force rotation of current log files."""
        self.stdout.write('Forcing log rotation...')
        
        # Get current timestamp for rotation
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Find current log files (not already rotated)
        current_logs = [f for f in logs_dir.glob('*.log') if not f.name.endswith('.log.')]
        
        for log_file in current_logs:
            if log_file.stat().st_size > 0:  # Only rotate non-empty files
                rotated_name = f"{log_file.name}.{timestamp}"
                rotated_path = log_file.parent / rotated_name
                
                try:
                    shutil.move(str(log_file), str(rotated_path))
                    self.stdout.write(f'Rotated: {log_file.name} -> {rotated_name}')
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'Error rotating {log_file.name}: {e}')
                    )

        self.stdout.write(self.style.SUCCESS('Log rotation completed.')) 