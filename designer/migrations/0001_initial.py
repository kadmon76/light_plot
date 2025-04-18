# Generated by Django 5.2 on 2025-04-11 18:01

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='LightFixture',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('manufacturer', models.CharField(max_length=100)),
                ('fixture_type', models.CharField(max_length=50)),
                ('wattage', models.IntegerField(default=0)),
                ('beam_angle', models.FloatField(default=0.0)),
                ('weight', models.FloatField(default=0.0)),
                ('svg_icon', models.TextField(help_text='SVG vector data for the fixture')),
                ('width', models.FloatField(default=1.0)),
                ('height', models.FloatField(default=1.0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Stage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('width', models.FloatField(help_text='Width in meters/feet')),
                ('depth', models.FloatField(help_text='Depth in meters/feet')),
                ('height', models.FloatField(help_text='Height in meters/feet')),
                ('svg_data', models.TextField(blank=True, help_text='SVG vector data for custom stage shape')),
                ('unit', models.CharField(choices=[('m', 'Meters'), ('ft', 'Feet')], default='m', max_length=2)),
                ('has_fly_system', models.BooleanField(default=False)),
                ('has_pit', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='StageTemplate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('template_type', models.CharField(choices=[('front', 'Front Lights'), ('side', 'Side Lights'), ('back', 'Back Lights'), ('top', 'Top Lights'), ('cyc', 'Cyclorama Lights'), ('special', 'Special'), ('custom', 'Custom')], max_length=20)),
                ('positions_data', models.JSONField(help_text='JSON data defining fixture positions')),
                ('preview_svg', models.TextField(blank=True, help_text='SVG preview of the template')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['template_type', 'name'],
            },
        ),
        migrations.CreateModel(
            name='LightingPlot',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('show_name', models.CharField(blank=True, max_length=200)),
                ('venue', models.CharField(blank=True, max_length=200)),
                ('designer', models.CharField(blank=True, max_length=100)),
                ('date', models.DateField(blank=True, null=True)),
                ('plot_data', models.JSONField(default=dict, help_text='JSON data of the entire plot')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='plots', to=settings.AUTH_USER_MODEL)),
                ('stage', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='designer.stage')),
            ],
            options={
                'ordering': ['-updated_at'],
            },
        ),
        migrations.CreateModel(
            name='PlotFixture',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('x_position', models.FloatField()),
                ('y_position', models.FloatField()),
                ('z_position', models.FloatField(default=0)),
                ('rotation', models.FloatField(default=0)),
                ('channel', models.IntegerField(blank=True, null=True)),
                ('dimmer', models.IntegerField(blank=True, null=True)),
                ('circuit', models.CharField(blank=True, max_length=20)),
                ('color', models.CharField(blank=True, max_length=20)),
                ('purpose', models.CharField(blank=True, max_length=200)),
                ('notes', models.TextField(blank=True)),
                ('fixture_type', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='designer.lightfixture')),
                ('plot', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='fixtures', to='designer.lightingplot')),
            ],
            options={
                'ordering': ['channel'],
            },
        ),
    ]
