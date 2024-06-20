<?php
 
namespace App\DataFixtures;
 
use App\Entity\User;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
 
class UserFixtures extends Fixture {
 
	public function __construct(UserPasswordEncoderInterface $passwordEncoder)
	{
		$this->passwordEncoder = $passwordEncoder;
	}
 
	public function load(ObjectManager $manager) {
		// Exemples de données à insérer dans la base de données
		$user_list = [
			['pseudo' => 'admin', 'passwd' => '123', 'roles' => ['ROLE_USER', 'ROLE_ADMIN']],
			['pseudo' => 'david', 'passwd' => '456', 'roles' => ['ROLE_USER']],
		];
		// Boucle pour chaque ligne
		foreach ($user_list as $user_data) {
			// Crée une nouvelle entité
			$user = new User();
			// Donne des valeurs à ses attributs
			$user->setPseudo($user_data['pseudo']);
			$user->setPassword($this->passwordEncoder->encodePassword($user, $user_data['passwd']));
			$user->setRoles($user_data['roles']);
			// Enregistre dans la BDD (INSERT)
			$manager->persist($user);
		}
		$manager->flush();
	}
}