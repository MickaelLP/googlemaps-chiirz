<?php
namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use App\Entity\Itinerary;
use App\Entity\City;
use App\Entity\User;
use App\Entity\Like;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Doctrine\ORM\EntityManagerInterface;

 
class StaticPages extends AbstractController
{
    /**
     * @Route("/", name="home")
     */
    public function home(EntityManagerInterface $entityManager): Response
    {

        $itineraryRepository = $entityManager->getRepository(Itinerary::class);
        
        $itineraryCount = $itineraryRepository->createQueryBuilder('i')
            ->select('COUNT(i.id)')
            ->getQuery()
            ->getSingleScalarResult();
        
        $itineraryViews = $itineraryRepository->createQueryBuilder('i')
            ->select('SUM(i.views)')
            ->getQuery()
            ->getSingleScalarResult();

        $userRepository = $entityManager->getRepository(User::class);
        
        $userCount = $userRepository->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->getQuery()
            ->getSingleScalarResult();

        
        $titre = 'Bienvenue';
 
        return $this->render('home.html.twig', [
            'userCount' => $userCount,
            'itineraryViews' => $itineraryViews,
            'itineraryCount' => $itineraryCount,
            'titre' => $titre
        ]);
    }

    /** 
     * @Route("/itinerary/get_bar/{id}", name="get_bar") 
    */ 
    public function getBar($id)
    {
        // Get the 'bar' field from the 'itinerary' table
        $entityManager = $this->getDoctrine()->getManager();
        $query = $entityManager->createQueryBuilder()
            ->select('i.bar')
            ->from('App\Entity\Itinerary', 'i')
            ->where('i.id = :id')
            ->setParameter('id', $id)
            ->getQuery();
        $bars = $query->getResult();

        // Convert the results to a JSON response
        $response = new JsonResponse($bars);

        return $response;
    }

    /** 
     * @Route("/itinerary/delete_like/{id}", name="delete_like") 
    */ 
    public function deleteLike($id)
    {
        $entityManager = $this->getDoctrine()->getManager();

        $queryBuilder = $entityManager->createQueryBuilder();
        $queryBuilder->delete('App\Entity\Like', 'l')
            ->where('l.id = :id')
            ->setParameter('id', $id);

        $query = $queryBuilder->getQuery();
        $result = $query->execute();

        return new Response('Deleted itinerary with id ' . $id);
    }

    /** 
     * @Route("/itinerary/add_fav/{id}", name="add_fav") 
    */ 
    public function addToFavorites($id, EntityManagerInterface $entityManager)
    {
        // Get the JSON data from the request body
        $json = file_get_contents('php://input');

        // Decode the JSON data into a PHP associative array
        $data = json_decode($json, true);


        $fk_itinerary = $data["fk_itinerary"];
        $itineray = $entityManager->getRepository(Itinerary::class)->find($fk_itinerary);
        
        $fk_user = $data["fk_user"];
        $user = $entityManager->getRepository(User::class)->find($fk_user);

        $entityManager = $this->getDoctrine()->getManager();

        $like = new Like();
        $like->setFkItinerary($itineray);
        $like->setFkUser($user);        

        $entityManager->persist($like);
        $entityManager->flush();

        return new Response($like->getId());
    }

    /** 
     * @Route("/itinerary/insert_bar/{id}", name="insert_bar") 
    */ 
    public function insertBar($id, EntityManagerInterface $entityManager)
    {

        // Get the JSON data from the request body
        $json = file_get_contents('php://input');

        // Decode the JSON data into a PHP associative array
        $data = json_decode($json, true);

        $text = $data["text"];
        $name = $data["name"];
        $distance = $data["distance"];
        $bar = $data["bar"];

        $fk_city_id = $data["fk_city_id"];
        $city = $entityManager->getRepository(City::class)->find($fk_city_id);

        $fk_user_id = $data["fk_user_id"];
        $user = $entityManager->getRepository(User::class)->find($fk_user_id);

        $entityManager = $this->getDoctrine()->getManager();

        $itinerary = new Itinerary();
        $itinerary->setText($text);
        $itinerary->setName($name);
        $itinerary->setFkCity($city);
        $itinerary->setDistance($distance);
        $itinerary->setFkUser($user);
        $itinerary->setBar($bar);

        $entityManager->persist($itinerary);
        $entityManager->flush();

        return new Response('Saved new itinerary !');
    }

    /** 
     * @Route("/itinerary/edit_bar/{id}", name="edit_bar") 
    */ 
    public function editBar(Itinerary $itinerary, $id, EntityManagerInterface $entityManager)
    {

        // Get the JSON data from the request body
        $json = file_get_contents('php://input');

        // Decode the JSON data into a PHP associative array
        $data = json_decode($json, true);

        $text = $data["text"];
        $name = $data["name"];
        $distance = $data["distance"];
        $bar = $data["bar"];

        $fk_city_id = $data["fk_city_id"];
        $city = $entityManager->getRepository(City::class)->find($fk_city_id);

        $fk_user_id = $data["fk_user_id"];
        $user = $entityManager->getRepository(User::class)->find($fk_user_id);

        $entityManager = $this->getDoctrine()->getManager();
;
        $itinerary->setText($text);
        $itinerary->setName($name);
        $itinerary->setFkCity($city);
        $itinerary->setDistance($distance);
        $itinerary->setFkUser($user);
        $itinerary->setBar($bar);

        $entityManager->persist($itinerary);
        $entityManager->flush();

        return new Response('Saved new itinerary !');
    }

    /**
     * @Route("/mention_legales", name="mention_legales")
     */
    public function mentionLegales(): Response
    {
        $titre = 'Mentions légales';
 
        return $this->render('mentions.html.twig', [
            'titre' => $titre
        ]);
    }
}