"""
Django management command to subscribe all existing users to notification topics
"""
from django.core.management.base import BaseCommand
from reports.models import ExpoPushToken
from reports.services.appwrite_service import subscribe_user_to_topic

class Command(BaseCommand):
    help = 'Subscribe all existing users with push tokens to notification topics'

    def handle(self, *args, **options):
        self.stdout.write("🔄 Subscribing existing users to notification topics...")
        
        # Get all push tokens
        tokens = ExpoPushToken.objects.all()
        
        if not tokens.exists():
            self.stdout.write(self.style.WARNING("No push tokens found in database"))
            return
        
        # Default topics for all users
        default_topics = ['general-notifications', 'emergency-alerts', 'injury_reports', 'volunteer_updates']
        
        total_subscriptions = 0
        failed_subscriptions = 0
        
        for token_obj in tokens:
            self.stdout.write(f"Processing user {token_obj.user_id}...")
            
            for topic in default_topics:
                try:
                    result = subscribe_user_to_topic(
                        token_obj.user_id, 
                        topic, 
                        token_obj.token
                    )
                    
                    if result:
                        total_subscriptions += 1
                        self.stdout.write(f"  ✅ Subscribed to {topic}")
                    else:
                        failed_subscriptions += 1
                        self.stdout.write(f"  ❌ Failed to subscribe to {topic}")
                        
                except Exception as e:
                    failed_subscriptions += 1
                    self.stdout.write(f"  ❌ Error subscribing to {topic}: {e}")
        
        self.stdout.write("\n" + "="*50)
        self.stdout.write(self.style.SUCCESS(f"✅ Total successful subscriptions: {total_subscriptions}"))
        self.stdout.write(self.style.ERROR(f"❌ Total failed subscriptions: {failed_subscriptions}"))
        self.stdout.write(f"📱 Processed {tokens.count()} users")
        self.stdout.write("="*50)
