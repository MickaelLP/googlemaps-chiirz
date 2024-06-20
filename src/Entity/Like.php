<?php

namespace App\Entity;

use App\Repository\LikeRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LikeRepository::class)]
#[ORM\Table(name: '`like`')]
class Like
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'likes')]
    private ?Itinerary $fk_itinerary = null;

    #[ORM\ManyToOne(inversedBy: 'likes')]
    private ?User $fk_user = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFkItinerary(): ?Itinerary
    {
        return $this->fk_itinerary;
    }

    public function setFkItinerary(?Itinerary $fk_itinerary): self
    {
        $this->fk_itinerary = $fk_itinerary;

        return $this;
    }

    public function getFkUser(): ?User
    {
        return $this->fk_user;
    }

    public function setFkUser(?User $fk_user): self
    {
        $this->fk_user = $fk_user;

        return $this;
    }
}
