<?php

namespace App\Form;

use App\Entity\Itinerary;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Range;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;


class ItineraryType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('fk_city')
            ->add('text', null, [
                'attr' => [
                    'placeholder' => '🎤 Un petit mot ? ',
                    'required' => true
                ]
            ])
            ->add('name', null, [
                'attr' => [
                    'placeholder' => 'Nom de la route',
                    'required' => true,
                    'maxlength' => 24
                ]
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Itinerary::class,
        ]);
    }
}
