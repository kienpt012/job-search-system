<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JskillSeeder extends Seeder
{
    public function run(): void
    {
        $skills = [
            'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular',
            'Node.js', 'Express.js', 'PHP', 'Laravel', 'Java', 'Spring Boot', 'C#',
            '.NET', 'Python', 'Django', 'Flask', 'Go', 'Ruby on Rails', 'C++', 'C',
            'Kotlin', 'Swift', 'Flutter', 'React Native', 'MySQL', 'PostgreSQL',
            'SQL Server', 'MongoDB', 'Redis', 'Elasticsearch', 'Docker', 'Kubernetes',
            'AWS', 'Azure', 'Google Cloud', 'Linux', 'Git', 'CI/CD', 'REST API',
            'GraphQL', 'Microservices', 'DevOps', 'Cybersecurity', 'Data Analysis',
            'Power BI', 'Excel', 'Machine Learning', 'AI', 'UI/UX', 'Figma',
            'Photoshop', 'Illustrator', 'SEO', 'Content Marketing', 'Digital Marketing',
            'Sales', 'Customer Service', 'Project Management', 'Agile', 'Scrum',
            'Business Analysis', 'Accounting', 'Finance', 'Recruitment', 'HR',
            'English Communication', 'Japanese', 'Korean', 'Leadership',
            'Problem Solving', 'Teamwork', 'Communication',
        ];

        $existingNames = DB::table('jskills')->pluck('name')->map(fn ($name) => strtolower($name))->toArray();

        foreach ($skills as $skill) {
            if (!in_array(strtolower($skill), $existingNames, true)) {
                DB::table('jskills')->insert(['name' => $skill]);
            }
        }
    }
}
