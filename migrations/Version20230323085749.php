<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20230323085749 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE itinerary DROP FOREIGN KEY FK_FF2238F67B835F83');
        $this->addSql('ALTER TABLE itinerary DROP FOREIGN KEY FK_FF2238F65741EEB9');
        $this->addSql('ALTER TABLE itinerary ADD CONSTRAINT FK_FF2238F67B835F83 FOREIGN KEY (fk_city_id) REFERENCES city (id)');
        $this->addSql('ALTER TABLE itinerary ADD CONSTRAINT FK_FF2238F65741EEB9 FOREIGN KEY (fk_user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE `like` DROP FOREIGN KEY FK_AC6340B3342A35AB');
        $this->addSql('ALTER TABLE `like` DROP FOREIGN KEY FK_AC6340B35741EEB9');
        $this->addSql('ALTER TABLE `like` DROP rate, DROP favorite');
        $this->addSql('ALTER TABLE `like` ADD CONSTRAINT FK_AC6340B3342A35AB FOREIGN KEY (fk_itinerary_id) REFERENCES itinerary (id)');
        $this->addSql('ALTER TABLE `like` ADD CONSTRAINT FK_AC6340B35741EEB9 FOREIGN KEY (fk_user_id) REFERENCES user (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE itinerary DROP FOREIGN KEY FK_FF2238F67B835F83');
        $this->addSql('ALTER TABLE itinerary DROP FOREIGN KEY FK_FF2238F65741EEB9');
        $this->addSql('ALTER TABLE itinerary ADD CONSTRAINT FK_FF2238F67B835F83 FOREIGN KEY (fk_city_id) REFERENCES city (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE itinerary ADD CONSTRAINT FK_FF2238F65741EEB9 FOREIGN KEY (fk_user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE `like` DROP FOREIGN KEY FK_AC6340B3342A35AB');
        $this->addSql('ALTER TABLE `like` DROP FOREIGN KEY FK_AC6340B35741EEB9');
        $this->addSql('ALTER TABLE `like` ADD rate SMALLINT DEFAULT NULL, ADD favorite TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE `like` ADD CONSTRAINT FK_AC6340B3342A35AB FOREIGN KEY (fk_itinerary_id) REFERENCES itinerary (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE `like` ADD CONSTRAINT FK_AC6340B35741EEB9 FOREIGN KEY (fk_user_id) REFERENCES user (id) ON DELETE CASCADE');
    }
}
