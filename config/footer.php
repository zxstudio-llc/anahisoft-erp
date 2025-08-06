<?php

return [
    'templates' => [
        'simple' => [
            'name' => 'Plantilla Simple',
            'description' => 'Footer minimalista con solo copyright',
            'default_content' => [
                'copyright' => '© '.date('Y').' Your Company, Inc. All rights reserved.',
                'social_links' => [
                    ['icon' => 'facebook', 'url' => '#'],
                    ['icon' => 'twitter', 'url' => '#'],
                    ['icon' => 'instagram', 'url' => '#'],
                    ['icon' => 'linkedin', 'url' => '#'],
                ],
                'brands' => [
                    ['image' => null, 'alt' => '', 'url' => '#'],
                    ['image' => null, 'alt' => '', 'url' => '#'],
                    ['image' => null, 'alt' => '', 'url' => '#'],
                ]
            ]
        ],
        'standard' => [
            'name' => 'Plantilla Estándar',
            'description' => 'Footer con una sola fila de enlaces',
            'default_content' => [
                'links' => [
                    ['text' => 'About', 'url' => '/about'],
                    ['text' => 'Blog', 'url' => '/blog'],
                    ['text' => 'Jobs', 'url' => '/jobs'],
                    ['text' => 'Press', 'url' => '/press'],
                    ['text' => 'Accessibility', 'url' => '/accessibility'],
                    ['text' => 'Partners', 'url' => '/partners'],
                ],
                'copyright' => '© '.date('Y').' Your Company, Inc. All rights reserved.',
                'social_links' => [
                    ['icon' => 'facebook', 'url' => '#'],
                    ['icon' => 'twitter', 'url' => '#'],
                    ['icon' => 'instagram', 'url' => '#'],
                    ['icon' => 'linkedin', 'url' => '#'],
                ],
                'brands' => [
                    ['image' => null, 'alt' => 'Brand 1', 'url' => '#'],
                    ['image' => null, 'alt' => 'Brand 2', 'url' => '#'],
                    ['image' => null, 'alt' => 'Brand 3', 'url' => '#'],
                ]
            ]
        ],
        'basic' => [
            'name' => 'Plantilla Básica',
            'description' => 'Footer con secciones organizadas en tabla',
            'default_content' => [
                'columns' => [
                    [
                        'title' => 'Solutions',
                        'links' => [
                            ['text' => 'Marketing', 'url' => '/marketing'],
                            ['text' => 'Analytics', 'url' => '/analytics'],
                            ['text' => 'Automation', 'url' => '/automation'],
                            ['text' => 'Commerce', 'url' => '/commerce'],
                            ['text' => 'Insights', 'url' => '/insights'],
                        ]
                    ],
                    [
                        'title' => 'Support',
                        'links' => [
                            ['text' => 'Submit ticket', 'url' => '/support'],
                            ['text' => 'Documentation', 'url' => '/docs'],
                            ['text' => 'Guides', 'url' => '/guides'],
                        ]
                    ],
                    [
                        'title' => 'Company',
                        'links' => [
                            ['text' => 'About', 'url' => '/about'],
                            ['text' => 'Blog', 'url' => '/blog'],
                            ['text' => 'Jobs', 'url' => '/jobs'],
                            ['text' => 'Press', 'url' => '/press'],
                        ]
                    ],
                    [
                        'title' => 'Legal',
                        'links' => [
                            ['text' => 'Terms of service', 'url' => '/terms'],
                            ['text' => 'Privacy policy', 'url' => '/privacy'],
                            ['text' => 'License', 'url' => '/license'],
                        ]
                    ]
                ],
                'copyright' => '© '.date('Y').' Your Company, Inc. All rights reserved.',
                'social_links' => [
                    ['icon' => 'facebook', 'url' => '#'],
                    ['icon' => 'twitter', 'url' => '#'],
                    ['icon' => 'instagram', 'url' => '#'],
                    ['icon' => 'linkedin', 'url' => '#'],
                ],
                'brands' => [
                    ['image' => null, 'alt' => 'Brand 1', 'url' => '#'],
                    ['image' => null, 'alt' => 'Brand 2', 'url' => '#'],
                    ['image' => null, 'alt' => 'Brand 3', 'url' => '#'],
                ]
            ]
        ],
        'advanced' => [
            'name' => 'Plantilla Avanzada',
            'description' => 'Footer con múltiples filas de enlaces organizados jerárquicamente',
            'default_content' => [
                'rows' => [
                    [
                        'title' => 'Solutions',
                        'items' => [
                            ['text' => 'Marketing', 'url' => '/marketing'],
                            ['text' => 'Analytics', 'url' => '/analytics'],
                            ['text' => 'Automation', 'url' => '/automation'],
                            ['text' => 'Commerce', 'url' => '/commerce'],
                            ['text' => 'Insights', 'url' => '/insights'],
                        ]
                    ],
                    [
                        'title' => 'Support',
                        'items' => [
                            ['text' => 'Submit ticket', 'url' => '/support'],
                            ['text' => 'Documentation', 'url' => '/docs'],
                            ['text' => 'Guides', 'url' => '/guides'],
                        ]
                    ],
                    [
                        'title' => 'Company',
                        'items' => [
                            ['text' => 'About', 'url' => '/about'],
                            ['text' => 'Blog', 'url' => '/blog'],
                            ['text' => 'Jobs', 'url' => '/jobs'],
                            ['text' => 'Press', 'url' => '/press'],
                        ]
                    ],
                    [
                        'title' => 'Legal',
                        'items' => [
                            ['text' => 'Terms of service', 'url' => '/terms'],
                            ['text' => 'Privacy policy', 'url' => '/privacy'],
                            ['text' => 'License', 'url' => '/license'],
                        ]
                    ]
                ],
                'copyright' => '© '.date('Y').' Your Company, Inc. All rights reserved.',
                'slogan' => 'Making the world a better place through constructing elegant hierarchies.',
                'social_links' => [
                    ['icon' => 'facebook', 'url' => '#'],
                    ['icon' => 'twitter', 'url' => '#'],
                    ['icon' => 'instagram', 'url' => '#'],
                    ['icon' => 'linkedin', 'url' => '#'],
                ],
                'brands' => [
                    ['image' => null, 'alt' => '', 'url' => '#'],
                    ['image' => null, 'alt' => '', 'url' => '#'],
                    ['image' => null, 'alt' => '', 'url' => '#'],
                ]
            ]
        ],
    ]
];