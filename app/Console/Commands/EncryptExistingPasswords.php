<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tenant\Settings;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

class EncryptExistingPasswords extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'encrypt:passwords {--dry-run : Show what would be encrypted without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Encrypt existing sol_pass and certificate_password fields in settings table';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');
        
        if ($dryRun) {
            $this->info('DRY RUN MODE - No changes will be made');
        }
        
        $this->info('Starting password encryption process...');
        
        // Get all settings records
        $settings = DB::table('settings')->get();
        
        $encryptedCount = 0;
        $skippedCount = 0;
        
        foreach ($settings as $setting) {
            $updated = false;
            $updateData = [];
            
            // Check sol_pass
            if (!empty($setting->sol_pass)) {
                try {
                    // Try to decrypt - if it fails, it's not encrypted
                    Crypt::decryptString($setting->sol_pass);
                    $this->line("Setting ID {$setting->id}: sol_pass already encrypted");
                    $skippedCount++;
                } catch (\Exception $e) {
                    // Not encrypted, so encrypt it
                    $updateData['sol_pass'] = Crypt::encryptString($setting->sol_pass);
                    $this->line("Setting ID {$setting->id}: sol_pass will be encrypted");
                    $updated = true;
                }
            }
            
            // Check certificate_password
            if (!empty($setting->certificate_password)) {
                try {
                    // Try to decrypt - if it fails, it's not encrypted
                    Crypt::decryptString($setting->certificate_password);
                    $this->line("Setting ID {$setting->id}: certificate_password already encrypted");
                    $skippedCount++;
                } catch (\Exception $e) {
                    // Not encrypted, so encrypt it
                    $updateData['certificate_password'] = Crypt::encryptString($setting->certificate_password);
                    $this->line("Setting ID {$setting->id}: certificate_password will be encrypted");
                    $updated = true;
                }
            }
            
            // Update if needed and not in dry run mode
            if ($updated && !$dryRun) {
                DB::table('settings')
                    ->where('id', $setting->id)
                    ->update($updateData);
                $encryptedCount++;
            } elseif ($updated && $dryRun) {
                $encryptedCount++;
            }
        }
        
        if ($dryRun) {
            $this->info("DRY RUN COMPLETE:");
            $this->info("- {$encryptedCount} passwords would be encrypted");
            $this->info("- {$skippedCount} passwords already encrypted (skipped)");
            $this->info("Run without --dry-run to apply changes");
        } else {
            $this->info("ENCRYPTION COMPLETE:");
            $this->info("- {$encryptedCount} passwords encrypted");
            $this->info("- {$skippedCount} passwords already encrypted (skipped)");
        }
        
        return 0;
    }
}