<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('company_branches')) {
            Schema::create('company_branches', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('employer_id')->index();
                $table->string('name', 180);
                $table->string('address', 500)->nullable();
                $table->decimal('map_lat', 10, 7)->nullable();
                $table->decimal('map_lng', 10, 7)->nullable();
                $table->string('contact_name', 120)->nullable();
                $table->string('phone', 40)->nullable();
                $table->string('email')->nullable();
                $table->boolean('is_headquarters')->default(false)->index();
                $table->boolean('is_active')->default(true)->index();
                $table->timestamps();

                $table->index(['employer_id', 'is_active']);
            });
        }

        if (!Schema::hasTable('company_members')) {
            Schema::create('company_members', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('employer_id')->index();
                $table->unsignedBigInteger('branch_id')->nullable()->index();
                $table->unsignedBigInteger('user_id')->unique();
                $table->string('role', 40)->index();
                $table->string('name', 160)->nullable();
                $table->string('phone', 40)->nullable();
                $table->string('title', 120)->nullable();
                $table->string('status', 30)->default('active')->index();
                $table->unsignedBigInteger('created_by')->nullable();
                $table->timestamps();

                $table->index(['employer_id', 'branch_id', 'role']);
            });
        }

        if (!Schema::hasTable('audit_logs')) {
            Schema::create('audit_logs', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('actor_user_id')->nullable()->index();
                $table->unsignedBigInteger('impersonator_user_id')->nullable()->index();
                $table->unsignedBigInteger('employer_id')->nullable()->index();
                $table->unsignedBigInteger('branch_id')->nullable()->index();
                $table->string('action', 120)->index();
                $table->string('target_type', 120)->nullable();
                $table->unsignedBigInteger('target_id')->nullable();
                $table->json('before_payload')->nullable();
                $table->json('after_payload')->nullable();
                $table->ipAddress('ip_address')->nullable();
                $table->text('user_agent')->nullable();
                $table->text('note')->nullable();
                $table->timestamps();

                $table->index(['target_type', 'target_id']);
            });
        }

        Schema::table('jobs', function (Blueprint $table) {
            if (!Schema::hasColumn('jobs', 'branch_id')) {
                $table->unsignedBigInteger('branch_id')->nullable()->after('employer_id')->index();
            }

            if (!Schema::hasColumn('jobs', 'posted_by_user_id')) {
                $table->unsignedBigInteger('posted_by_user_id')->nullable()->after('branch_id')->index();
            }

            if (!Schema::hasColumn('jobs', 'work_location_type')) {
                $table->string('work_location_type', 30)->default('onsite')->after('gender')->index();
            }

            if (!Schema::hasColumn('jobs', 'special_address')) {
                $table->string('special_address', 500)->nullable()->after('work_location_type');
            }

            if (!Schema::hasColumn('jobs', 'map_lat')) {
                $table->decimal('map_lat', 10, 7)->nullable()->after('special_address');
            }

            if (!Schema::hasColumn('jobs', 'map_lng')) {
                $table->decimal('map_lng', 10, 7)->nullable()->after('map_lat');
            }

            if (!Schema::hasColumn('jobs', 'education_level')) {
                $table->string('education_level', 120)->nullable()->after('yoe');
            }

            if (!Schema::hasColumn('jobs', 'required_languages')) {
                $table->text('required_languages')->nullable()->after('description');
            }

            if (!Schema::hasColumn('jobs', 'required_certificates')) {
                $table->text('required_certificates')->nullable()->after('required_languages');
            }

            if (!Schema::hasColumn('jobs', 'requirements')) {
                $table->longText('requirements')->nullable()->after('required_certificates');
            }

            if (!Schema::hasColumn('jobs', 'benefits')) {
                $table->longText('benefits')->nullable()->after('requirements');
            }

            if (!Schema::hasColumn('jobs', 'status')) {
                $table->string('status', 30)->default('active')->after('is_active')->index();
            }
        });

        Schema::table('job_skill', function (Blueprint $table) {
            if (!Schema::hasColumn('job_skill', 'requirement_type')) {
                $table->string('requirement_type', 30)->default('required')->after('skill_id')->index();
            }
        });

        $this->backfillHeadquarters();
        $this->backfillJobFields();
    }

    public function down(): void
    {
        Schema::table('job_skill', function (Blueprint $table) {
            if (Schema::hasColumn('job_skill', 'requirement_type')) {
                $table->dropColumn('requirement_type');
            }
        });

        Schema::table('jobs', function (Blueprint $table) {
            $dropColumns = array_values(array_filter([
                Schema::hasColumn('jobs', 'branch_id') ? 'branch_id' : null,
                Schema::hasColumn('jobs', 'posted_by_user_id') ? 'posted_by_user_id' : null,
                Schema::hasColumn('jobs', 'work_location_type') ? 'work_location_type' : null,
                Schema::hasColumn('jobs', 'special_address') ? 'special_address' : null,
                Schema::hasColumn('jobs', 'map_lat') ? 'map_lat' : null,
                Schema::hasColumn('jobs', 'map_lng') ? 'map_lng' : null,
                Schema::hasColumn('jobs', 'education_level') ? 'education_level' : null,
                Schema::hasColumn('jobs', 'required_languages') ? 'required_languages' : null,
                Schema::hasColumn('jobs', 'required_certificates') ? 'required_certificates' : null,
                Schema::hasColumn('jobs', 'requirements') ? 'requirements' : null,
                Schema::hasColumn('jobs', 'benefits') ? 'benefits' : null,
                Schema::hasColumn('jobs', 'status') ? 'status' : null,
            ]));

            if (count($dropColumns) > 0) {
                $table->dropColumn($dropColumns);
            }
        });

        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('company_members');
        Schema::dropIfExists('company_branches');
    }

    private function backfillHeadquarters(): void
    {
        $now = now();
        $existingBranchEmployerIds = DB::table('company_branches')->pluck('employer_id')->all();

        DB::table('employers')
            ->whereNotIn('id', $existingBranchEmployerIds)
            ->orderBy('id')
            ->chunk(100, function ($employers) use ($now) {
                foreach ($employers as $employer) {
                    DB::table('company_branches')->insert([
                        'employer_id' => $employer->id,
                        'name' => 'Trụ sở chính',
                        'address' => $employer->address,
                        'map_lat' => property_exists($employer, 'map_lat') ? $employer->map_lat : null,
                        'map_lng' => property_exists($employer, 'map_lng') ? $employer->map_lng : null,
                        'contact_name' => $employer->contact_name,
                        'phone' => $employer->phone,
                        'email' => null,
                        'is_headquarters' => true,
                        'is_active' => true,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            });

        DB::table('employers')
            ->join('company_branches', function ($join) {
                $join->on('company_branches.employer_id', '=', 'employers.id')
                    ->where('company_branches.is_headquarters', '=', 1);
            })
            ->join('users', 'users.id', '=', 'employers.user_id')
            ->select('employers.id as employer_id', 'employers.user_id', 'company_branches.id as branch_id')
            ->orderBy('employers.id')
            ->chunk(100, function ($rows) use ($now) {
                foreach ($rows as $row) {
                    if (DB::table('company_members')->where('user_id', $row->user_id)->exists()) {
                        continue;
                    }

                    DB::table('company_members')->insert([
                        'employer_id' => $row->employer_id,
                        'branch_id' => null,
                        'user_id' => $row->user_id,
                        'role' => 'company_owner',
                        'name' => null,
                        'phone' => null,
                        'title' => 'Tài khoản tổng công ty',
                        'status' => 'active',
                        'created_by' => null,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            });
    }

    private function backfillJobFields(): void
    {
        if (!Schema::hasColumn('jobs', 'branch_id')) {
            return;
        }

        $headquarters = DB::table('company_branches')
            ->where('is_headquarters', 1)
            ->pluck('id', 'employer_id');

        DB::table('jobs')
            ->join('employers', 'employers.id', '=', 'jobs.employer_id')
            ->whereNull('branch_id')
            ->select('jobs.*', 'employers.user_id as employer_user_id')
            ->orderBy('jobs.id')
            ->chunkById(200, function ($jobs) use ($headquarters) {
                foreach ($jobs as $job) {
                    DB::table('jobs')->where('id', $job->id)->update([
                        'branch_id' => $headquarters[$job->employer_id] ?? null,
                        'posted_by_user_id' => $job->employer_user_id,
                        'work_location_type' => 'onsite',
                        'special_address' => $job->address,
                        'status' => ((int) $job->is_active === 1) ? 'active' : 'paused',
                    ]);
                }
            }, 'jobs.id', 'id');
    }
};
