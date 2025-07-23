from django.core.management.base import BaseCommand
from notifications.notification_triggers import notification_triggers
from user.models import UserProfile, VolunteerApplication
from ngo.models import NGO
from reports.models import InjuryReport
import uuid


class Command(BaseCommand):
    help = 'Test the notification system with sample data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--type',
            type=str,
            choices=['volunteer_application', 'injury_report', 'emergency', 'announcement'],
            help='Type of notification to test'
        )

    def handle(self, *args, **options):
        notification_type = options['type']
        
        if notification_type == 'volunteer_application':
            self.test_volunteer_application()
        elif notification_type == 'injury_report':
            self.test_injury_report()
        elif notification_type == 'emergency':
            self.test_emergency_alert()
        elif notification_type == 'announcement':
            self.test_announcement()
        else:
            self.stdout.write(self.style.ERROR('Please specify a notification type'))
            return

    def test_volunteer_application(self):
        """Test volunteer application notifications"""
        self.stdout.write('Testing volunteer application notifications...')
        
        # Create test data
        try:
            # Get or create test NGO
            ngo, created = NGO.objects.get_or_create(
                appwrite_user_id='test_ngo_123',
                defaults={
                    'name': 'Test NGO',
                    'email': 'test@ngo.com',
                    'latitude': 12.9716,
                    'longitude': 77.5946,
                    'category': 'animal'
                }
            )
            
            # Get or create test user
            user_profile, created = UserProfile.objects.get_or_create(
                appwrite_user_id='test_user_123',
                defaults={
                    'name': 'Test User',
                    'email': 'test@user.com',
                    'is_volunteer': True
                }
            )
            
            # Create volunteer application
            application, created = VolunteerApplication.objects.get_or_create(
                user_id='test_user_123',
                ngo=ngo,
                defaults={
                    'message': 'I would like to volunteer for this NGO',
                    'status': 'pending'
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS('Created test volunteer application'))
                # This will automatically trigger the notification via signals
            else:
                self.stdout.write('Test volunteer application already exists')
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating test data: {e}'))

    def test_injury_report(self):
        """Test injury report notifications"""
        self.stdout.write('Testing injury report notifications...')
        
        try:
            # Create test injury report
            report = InjuryReport.objects.create(
                report_id=uuid.uuid4(),
                user_id='test_user_123',
                image_url='https://example.com/test-image.jpg',
                location='Test Location, Bangalore',
                latitude=12.9716,
                longitude=77.5946,
                report_data={
                    'severity': 'medium',
                    'animal_type': 'dog',
                    'description': 'Test injury report'
                }
            )
            
            self.stdout.write(self.style.SUCCESS('Created test injury report'))
            # This will automatically trigger the notification via signals
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating test injury report: {e}'))

    def test_emergency_alert(self):
        """Test emergency alert notifications"""
        self.stdout.write('Testing emergency alert notifications...')
        
        try:
            # Create test emergency report
            report = InjuryReport.objects.create(
                report_id=uuid.uuid4(),
                user_id='test_user_123',
                image_url='https://example.com/emergency-image.jpg',
                location='Emergency Location, Bangalore',
                latitude=12.9716,
                longitude=77.5946,
                report_data={
                    'severity': 'critical',
                    'animal_type': 'dog',
                    'description': 'Critical emergency - immediate attention required'
                }
            )
            
            self.stdout.write(self.style.SUCCESS('Created test emergency report'))
            # This will automatically trigger the emergency alert via signals
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating test emergency report: {e}'))

    def test_announcement(self):
        """Test general announcement notifications"""
        self.stdout.write('Testing general announcement notifications...')
        
        try:
            notification_triggers.notify_general_announcement(
                title='Test Announcement',
                body='This is a test announcement from the notification system',
                topic='general'
            )
            
            self.stdout.write(self.style.SUCCESS('Sent test announcement'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error sending test announcement: {e}')) 