<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use App\Models\User;

class Role extends SpatieRole
{
    public function users(): MorphToMany
    {
        return $this->morphedByMany(User::class, 'model', 'model_has_roles');
    }
}
